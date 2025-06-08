import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpSertSkillDto } from './dto/upsert-skill.dto';
import { SkillRepository } from 'src/databases/repositories/skill.repository';
import { SkillQueriesDto } from './dto/skill-query.dto';
import { ILike } from 'typeorm';
@Injectable()
export class SkillService {

  constructor( private readonly skillRepository : SkillRepository ){}

  async create(body : UpSertSkillDto){
    const skillRec = await this.skillRepository.save(body) ;
    
    return {
        message: 'Create skill successfully',
        result:skillRec
      }
  }

  async update(id:number, body : UpSertSkillDto){
    const skillRec = this.skillRepository.findOneBy({id})

    // check skill ton tai
    if(!skillRec){
      throw new HttpException('Skill not found ', HttpStatus.NOT_FOUND)
    }

    const skillUpdated = await this.skillRepository.save({
      ...skillRec,
      ...body,
    }) ;
    
    return {
        message: 'Update skill successfully',
        result:skillRec
      }
  }

  async delete(id:number){
    const skillRec = await this.skillRepository.delete({id})

    return {
      message: 'Delete skill successfully'
    }
  }

  async get(id:number){
    await this.skillRepository.findOneBy({id})

    return {
      message: 'Get detail skill successfully',
    }
  }

  async getAll (queries: SkillQueriesDto){
    const { name } = queries;

    // Điều kiện ở where , nếu name không được truyền vào thì trả về rỗng và then ra danh sách
    const whereClause = name ? {name:ILike(`%${name}%`)} : {}
    const result = await this.skillRepository.find({
      where: whereClause,
    })

    return {
      message:'Get all skill ',
      result,
    }
  }
}
