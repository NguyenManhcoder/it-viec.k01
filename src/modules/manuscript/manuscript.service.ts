import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { User } from 'src/databases/entities/user.entity';
import { UpsertManuscriptDto } from './dto/upsert-manuscript.dto';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { DataSource } from 'typeorm';
import { Manuscript } from 'src/databases/entities/manuscript.entity';
import { ManuscriptSkill } from 'src/databases/entities/manuscript-skill.entity';
@Injectable()
export class ManuscriptService {

  constructor( 
    private readonly manuscriptRepository : ManuscriptRepository, 
    private readonly companyRepository  :CompanyRepository ,
    private readonly dataSource: DataSource,
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

  async update(id:number,body:UpsertManuscriptDto,user:User){
    return{
      message: 'Update manuscript successfully',
        result:'manuscriptUpdate',
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

    return{
      message:'Success'
    }
  }
}
