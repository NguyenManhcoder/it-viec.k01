import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

import { User } from 'src/databases/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpsertApplicantDto } from './dto/upsert-applicant.dto';
import { ApplicantSkillRepository } from 'src/databases/repositories/applicant-skill.repository';
@Injectable() 
export class ApplicantService {

  constructor( 
    private readonly applicantRepository : ApplicantRepository ,
    private readonly applicantSkillRepository : ApplicantSkillRepository ,
    private readonly storageService : StorageService ,

  ){}

  async update(body : UpdateApplicantDto, user: User){

    const applicantRec  = await this.applicantRepository.findOne({
      where:{
        userId: user.id,
      },
    })  
    
    // if(!manuscriptRec){
    //   throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    // }

    // const applicant = await this.applicantRepository.findOne({
    //   where:{
    //     userId: user.id,
    //   }
    // })

    // // Validate file resume
    if(body.avatar){
      await this.storageService.getSignedUrl(body.avatar);
    }  


    const UpdatedApplicantRec = await this.applicantRepository.save({
      ...applicantRec,
      ...body,
    }) ;
    
    return {
        message: 'Update applicant successfully',
        result:UpdatedApplicantRec  
      }
  }

  async createSkill(body:UpsertApplicantDto,user:User){
    const applicantRec = await this.applicantRepository.findOne({
      where:{
        userId:user.id,
      }
    });

    const applicantSkillRec = await this.applicantSkillRepository.save({
      ...body,
      applicantId: applicantRec.id,
    });


    return {
      message:'Create applicant skill successfully'
    }
  }
  
  async updateSkill(body:UpsertApplicantDto,user:User,id:number){

    const applicantSkillRec = await this.applicantSkillRepository.findOneBy({
      id,
    })

      const applicantUpdateSkillRec = await this.applicantSkillRepository.save({
      ...applicantSkillRec,
      ...body,
    })

    return {
      message:'Update applicant skill successfully',
      result:applicantUpdateSkillRec,
    }
  }

  async getSkills(user:User){
    const applicantRec = await this.applicantRepository.findOne({
      where:{
        userId:user.id
      }
    });

    const applicantSkillRec = await this.applicantSkillRepository.find({
      where:{
        applicantId:applicantRec.id 
      }
    });

    return{
      message:'Get applicant skills successfully',
      result:applicantSkillRec,
    }
  }
}
