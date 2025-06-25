import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { User } from 'src/databases/entities/user.entity';
import { UpsertManuscriptDto } from './dto/upsert-manuscript.dto';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { DataSource } from 'typeorm';
import { Manuscript } from 'src/databases/entities/manuscript.entity';
import { ManuscriptSkill } from 'src/databases/entities/manuscript-skill.entity';
import { ManuscriptSkillRepository } from 'src/databases/repositories/manuscript-skill.repository';
import { manuscriptQueriesDto } from './dto/manusript-queries.dto';
import { convertKeySortManuscript } from 'src/commons/utils/helper';
import { RedisService } from '../redis/redis.service';
import { ManuscriptViewRepository } from 'src/databases/repositories/manuscript-view.repository';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
import { ManuscriptSaveRepository } from 'src/databases/repositories/manuscript-save.repository';
@Injectable()
export class ManuscriptService {

  constructor( 
    private readonly manuscriptRepository : ManuscriptRepository, 
    private readonly manuscriptSkillRepository : ManuscriptSkillRepository, 
    private readonly manuscriptViewRepository : ManuscriptViewRepository, 
    private readonly manuscriptSaveRepository : ManuscriptSaveRepository, 
    private readonly companyRepository  :CompanyRepository ,
    private readonly dataSource: DataSource,
    private readonly redisService:RedisService,
  ){}


  async create(body : UpsertManuscriptDto, user: User){

    // Thao tac len 2 bang => transaction

    // find company
    const companyRec = await this.companyRepository.findOneBy({
      userId : user.id,
    });

    // xoá đi để lưu vào manuscript vì nó không có trường này
    const { skillIds } = body;
    delete body.skillIds; 

    // Transaction

    const queryRunner = this.dataSource.createQueryRunner() ;
    await queryRunner.connect() ;
    await queryRunner.startTransaction()

    try {
      const manuscriptRec = await queryRunner.manager.save(Manuscript,{
        ...body,
        companyId : companyRec.id,
      }
      );


      // chuyen skillIds thanh object

      const manuscriptSkils = skillIds.map( (skillId) => ({
        manuscriptId : manuscriptRec.id,
        skillId ,
      }) 
      ); // manuscriptSkill :  [ { manuscriptId: 2, skillId: 4 } ]


      await queryRunner.manager.save(ManuscriptSkill,manuscriptSkils);

      await queryRunner.commitTransaction();

       return {
        message: 'Create manuscript successfully',
        result:manuscriptRec,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error;  
    } finally {
      await queryRunner.release()
    }
    
  }

  async update(id: number, body: UpsertManuscriptDto, user: User) {
  const companyRec = await this.companyRepository.findOneBy({
    userId: user.id,
  });

  const manuscriptRec = await this.manuscriptRepository.findOneBy({ id });

  if (!manuscriptRec || companyRec.id !== manuscriptRec.companyId) {
    throw new HttpException('User FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  const { skillIds } = body;
  delete body.skillIds;

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Cập nhật manuscript
    const manuscriptUpdated = await queryRunner.manager.save(Manuscript, {
      ...manuscriptRec, // giữ id cũ
      ...body,
      companyId: companyRec.id,
    });

    // Xóa các skill cũ
    await queryRunner.manager.delete(ManuscriptSkill, {
      manuscriptId: id,
    });

    // Tạo các skill mới
    const manuscriptSkills = skillIds.map(skillId => ({
      manuscriptId: id,
      skillId,
    }));
    await queryRunner.manager.save(ManuscriptSkill, manuscriptSkills);

    await queryRunner.commitTransaction();



    return {
      message: 'Update manuscript successfully',  
      result: manuscriptUpdated,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

  // get manuscript dùng caching
  // async get (id){
  //   const manuKey = 'manu' + id;

  //   // Step 1: get manuscriptRec tu redis
  //   const  manuscript = await this.redisService.getKey(manuKey); 
  //   let manuscriptRec: Manuscript;

  //   // Step 2: check manuscript redis is null
  //   if(!manuscript){

  //     // Step 3: neu khong co 
  //     // Step 3.1:  vao db lay
  //     manuscriptRec  = await this.manuscriptRepository.findOne({
  //       where:{
  //         id,
  //       }
  //     })  

  //     if(!manuscriptRec){
  //       throw new HttpException('Not found',HttpStatus.NOT_FOUND)
  //     }

  //     // Step 3.2:neu khong co thi vao db lay
  //     await this.redisService.setKey(manuKey,JSON.stringify(manuscriptRec));
  //   } else{
  //     manuscriptRec = JSON.parse(manuscript);
  //   }

   
  //   // Neu co trong redis thi tra ve 
  //   return{
  //     message:'Get manuscript successfully',
  //     result:manuscriptRec,
  //   }
  // }

   async get (id:number, user:User){

    console.log(user)
    const manuscriptRec  = await this.manuscriptRepository.findOne({
      where:{
        id,
      }
    })  

    if(!manuscriptRec){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }

    manuscriptRec['isUserFavorite'] = false;
    // nếu có user thì thực hiện save recent viewed job
    if(user){
      // Handle favorite
      const manuscriptSave = await this.manuscriptSaveRepository.findOneBy({
      manuscriptId:id,
      userId:user.id
    });

    if(manuscriptSave){
      manuscriptRec['isUserFavorite'] = true;
    }
      //Handle viewed

      const manuscriptViewRec = await this.manuscriptViewRepository.findOne({
        where:{
          userId:user.id,
          manuscriptId:id
        }
      })

      if(manuscriptViewRec){
        // Nếu có rồi thì update thời gian xem
        await this.manuscriptViewRepository.save({
          ...manuscriptViewRec,
          updatedAt:new Date(),
        })
      } else{
        // Nếu chưa có thì tạo ra bản ghi mới
        await this.manuscriptViewRepository.save({
          userId:user.id,
          manuscriptId:id,
        })
      }
    }

    
    return{
      message:'Get manuscript successfully',
      result:manuscriptRec,
    }
  }

  // Thực hiện xoá mềm(soft delete) : đánh dấu bản ghi đã xoá chứ không xoá hẳn trong DB
  async delete (id:number, user:User){
    // validate hr cos trong cong ty khong
    const companyRec = await this.companyRepository.findOneBy({
      userId:user.id,
    })

    const manuscriptRec = await this.manuscriptRepository.findOneBy({
      id,
    })

    if(companyRec.id !== manuscriptRec.companyId){
      throw new HttpException('User FORBIDDEN',HttpStatus.FORBIDDEN);
    }


    await this.manuscriptRepository.softDelete(id)
    // Xoá data trong redis vì dữ liệu thay đổi

    await this.redisService.setKey( 'manu' + id,'');
    return{
      message:'Success'
    }
  }


  async getAll (queries:manuscriptQueriesDto){

    const {
      page,
      limit,
      keyword,
      companyAddress,
      companyTypes,
      levels,
      workingModel,
      industryIds,
      maxSalary,
      minSalary,
      sort,
    } = queries;

    const skip = (page - 1) * limit;

    const queryBuilder = this.manuscriptRepository.createQueryBuilder('manuscript')
    .leftJoin('manuscript.company','c')
    .leftJoin('manuscript.manuscriptSkills','m')
    .leftJoin('m.skill','s')
    .select([
      'manuscript.id AS "id"',
      'manuscript.title AS "title"',
      'manuscript.minSalary AS "minSalary"',
      'manuscript.maxSalary AS "maxSalary"', 
      'manuscript.summary AS "summary"', 
      'manuscript.level AS "level"', 
      'manuscript.workingModel AS "workingModel"', 
      'manuscript.createdAt AS "createdAt"',
      'c.id AS "companyId"',
      'c.name AS "companyName"', 
      'c.location AS "companyAddress"', 
      'c.companySize AS "companySize"', 
      'c.companyType AS "companyType"', 
      'c.industry AS "companyIndustry"', 
      "JSON_AGG(json_build_object('id',s.id,'name',s.name)) AS manuscriptSkills",
    ]).groupBy('manuscript.id,c.id')
    

    // ĐIều kiện nếu có companyAddress truyền vào
    // Truyền mỗi address thì dùng = 
    if(companyAddress){
      queryBuilder.andWhere('c.location = :address',{
        address:companyAddress,
      })
    }

    if(companyTypes){
      //Truyền array thì dùng IN
      queryBuilder.andWhere('c.companyType IN (:...types)',{
        types:companyTypes,
      })
    }

    if(levels){
      //Truyền array thì dùng IN
      queryBuilder.andWhere('manuscript.level IN (:...levels)',{
        levels:levels,
      })
    }

    if(workingModel){
      //Truyền array thì dùng IN
      queryBuilder.andWhere('manuscript.workingModel IN (:...workingModel)',{
        workingModel:workingModel,
      })
    }

    if(industryIds){
      //Truyền array thì dùng IN
      queryBuilder.andWhere('c.industry IN (:...industryIds)',{
        industryIds:industryIds,
      })
    }

    if(minSalary && maxSalary){
      queryBuilder
      .andWhere('manuscript.minSalary <= :minSalary',{
        minSalary:minSalary,
      })
      .andWhere('manuscript.maxSalary => :maxSalary',{
        maxSalary:maxSalary,
      })
    }

    if(keyword){
      queryBuilder
      .andWhere('s.name ILIKE :keyword',{
        keyword:`%${keyword}%`,
      })
      .orWhere('manuscript.title ILIKE :keyword',{
        keyword:`%${keyword}`,
      })
      .orWhere('manuscript.summary ILIKE :keyword',{
        keyword:`%${keyword}`,
      })
    }

    if(sort){
      const order = convertKeySortManuscript(sort);
      console.log("order : ",order)
      for(const key of Object.keys(order)){
          queryBuilder.addOrderBy(keyword,order[key])
        }
    } else {
      queryBuilder.addOrderBy('manuscript.createdAt','DESC')
    }

    // limit là lấy số lượng bản ghi
    // offset là số bản ghi bỏ qua
    queryBuilder.limit(limit).offset(skip);

    const data = await queryBuilder.getRawMany();
    const total = await queryBuilder.getCount();


    return {
      message: "Get all manuscript success",
      result:{
        total,
        limit,
        page,
        data,
      }
    }
  }

  async getAllByViewed(queries: CommonQueryDto,user:User ){
    const {page,limit} = queries;
    const skip = (page - 1) * limit;
    const [data,total] = await this.manuscriptRepository.findAndCount({
      where:{
        manuscriptViews:{
          userId:user.id,
        }
      },
      skip,
      take:limit,
      relations:['manuscriptViews'],
      order:{
        manuscriptViews:{
          updatedAt:'DESC',
        }
      }
    })

    return{

      message:'Get recent manuscript successfully',
      result:{
        data,
        metadata:{
          total,
          page,
          limit,
        },
      }
    }
  }

  async favorite (id:number, user:User){
    const manuscriptSave = await this.manuscriptSaveRepository.findOneBy({
      manuscriptId:id,
      userId:user.id
    });

    if(manuscriptSave){
      await this.manuscriptSaveRepository.delete({
        manuscriptId:id,
        userId:user.id
    })} else{
      await this.manuscriptSaveRepository.save({
        manuscriptId:id,
        userId:user.id
    })
    };

    return{
      message:'Handle favorite manuscript successfully',
    }
  }
  async getAllByFavorite(queries: CommonQueryDto,user:User ){
    const {page,limit} = queries;
    const skip = (page - 1) * limit;

    const [data,total] = await this.manuscriptRepository.findAndCount({
      where:{
        manuscriptSaves:{
          userId:user.id,
        }
      },
      skip,
      take:limit,
      relations:['manuscriptViews'],
      order:{
        manuscriptSaves:{
          updatedAt:'ASC',
        }
      }
    })

    return{

      message:'Get favorite manuscript successfully',
      result:{
        data,
        metadata:{
          total,
          page,
          limit,
        },
      }
    }
  }



}
