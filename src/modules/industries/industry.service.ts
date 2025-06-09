import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpSertIndustryDto } from './dto/upsert-industry.dto';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';
import { IndustryQueriesDto } from './dto/industry-query.dto';
import { ILike } from 'typeorm';
@Injectable()
export class IndustryService {

  constructor( private readonly industryRepository : IndustryRepository ){}

  async create(body : UpSertIndustryDto){
    const industryRec = await this.industryRepository.save(body) ;
    
    return {
        message: 'Create industry successfully',
        result:industryRec
      }
  }

  async update(id:number, body : UpSertIndustryDto){
    const industryRec = this.industryRepository.findOneBy({id})

    // check industry ton tai
    if(!industryRec){
      throw new HttpException('Industry not found ', HttpStatus.NOT_FOUND)
    }

    const industryUpdated = await this.industryRepository.save({
      ...industryRec,
      ...body,
    }) ;
    
    return {
        message: 'Update industry successfully',
        result:industryRec
      }
  }

  async delete(id:number){
    const industryRec = await this.industryRepository.delete({id})

    return {
      message: 'Delete industry successfully'
    }
  }

  async get(id:number){
    await this.industryRepository.findOneBy({id})

    return {
      message: 'Get detail industry successfully',
    }
  }

  async getAll (queries: IndustryQueriesDto){
    const { name } = queries;

    // Điều kiện ở where , nếu name không được truyền vào thì trả về rỗng và then ra danh sách
    const whereClause = name ? {name:ILike(`%${name}%`)} : {}
    const result = await this.industryRepository.find({
      where: whereClause,
    })

    return {
      message:'Get all industry ',
      result,
    }
  }
}
