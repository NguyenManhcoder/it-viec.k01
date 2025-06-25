import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from 'src/databases/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { error } from 'console';
import { reviewCompanyDto } from './dto/review-company.dto';
import { CompanyReviewRepository } from 'src/databases/repositories/company-review.repository';
import { companyReviewDto } from './dto/company-review-query.dto';
@Injectable()
export class CompanyService {

  constructor( 
    private readonly companyRepository : CompanyRepository, 
    private readonly companyReviewRepository : CompanyReviewRepository, 
    private readonly storageService: StorageService ,
  ){}


  async update(id:number, body : UpdateCompanyDto, user: User){

    // Validate chi co hr trong company moi update duoc company do
    const companyRec = await this.companyRepository.findOneBy({id, userId: user.id})
    // check company ton tai
      if(!companyRec){
        throw new HttpException('Company not found ', HttpStatus.NOT_FOUND)
      }

    // Validate path logo
      if( body.logo){
        
        console.log("body.logo : ",body.logo)
        await this.storageService.getSignedUrl(body.logo)
      }
      

    const companyUpdated = await this.companyRepository.save({
      ...companyRec,
      ...body,
    });

    if(companyUpdated.logo){
      companyUpdated.logo = await this.storageService.getSignedUrl(
        companyUpdated.logo
      );
    }

    // Validate industry

    const industryRec = await this.companyRepository.findOneBy({ id : body.industryId })

    if(!industryRec){
      throw new error('Industry not found with id = '+ body.industryId,
        HttpStatus.NOT_FOUND,
      )
    }

    // delete ảnh cũ nếu thay đổi logo còn nếu vẫn thế thì không thay đổi
    if(companyRec.logo != body.logo){
      await this.companyRepository.delete(companyRec.logo);
    }
    
    return {
        message: 'Update company successfully',
        result:companyUpdated
      }
  }

  async createViewed(user:User, body:reviewCompanyDto){
    const companyReview = await this.companyReviewRepository.save({
      ...body,
      userId:user.id
    })

    return {
      message:'Review companysuccessfully',
      result:companyReview,
    }
  }

  async getReview(companyId:number, queries:companyReviewDto){
    const { limit,cursor } = queries; 

    const total = await this.companyReviewRepository
      .count({ where: { companyId }})

    const queryBuilder = await this.companyReviewRepository
    .createQueryBuilder('review')
    .where('review.companyId = :companyId',{ companyId })
    .orderBy('review.createdAt','DESC')
    .take(limit + 1);

    // Ví dụ :
    // có 10 bản ghi 
    // Limit = 20 => limit + 1 = 21 => lấy 21 bản ghi
    // results.length = 10

    // Limit = 5 +> lấy 6 bản ghi

    if(cursor){
      queryBuilder.andWhere('review.id < :cursor',{ cursor }); 
    }

    const results = await queryBuilder.getMany();

    let next = null;
    const hasNextPage = results.length > limit;
    if(hasNextPage){
      results.pop();
      next = results[results.length - 1].id;
    }


    return{
      message:'Get reviews company successfully',
      result:{
        data:results,
        pagination:{
          limit,
          next,
          total 
        }
      }
    }

  }



}
