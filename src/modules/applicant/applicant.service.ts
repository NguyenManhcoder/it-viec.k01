import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

import { User } from 'src/databases/entities/user.entity';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { StorageService } from '../storage/storage.service';
import { UpsertApplicantDto } from './dto/upsert-applicant.dto';
import { ApplicantSkillRepository } from 'src/databases/repositories/applicant-skill.repository';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
@Injectable() 
export class ApplicantService {

  constructor( 
    private readonly applicantRepository : ApplicantRepository ,
    private readonly manuscriptRepository : ManuscriptRepository ,
    private readonly applicantSkillRepository : ApplicantSkillRepository ,
    private readonly storageService : StorageService ,

  ){}

  async update(body : UpdateApplicantDto, user: User){

    const applicantRec  = await this.applicantRepository.findOne({
      where:{
        userId:user.id,
      },
    })  
    
    if(body.avatar ){
      await this.storageService.getSignedUrl(body.avatar);
    }

    const applicant = await this.applicantRepository.findOne({
      where:{
        userId: user.id,
      }
    })
    const updateApplicantRec = await this.applicantRepository.save({
      ...applicantRec,
      ...body,
    })

    
    return {
        message: 'Update applicant successfully',
        result:updateApplicantRec
      }
  }

  async createSkill(body:UpsertApplicantDto,user:User){
    const applicantRec = await this.applicantRepository.findOne({
      where:{
        userId:user.id,
      },
    });

    const applicantSkillRec = await this.applicantSkillRepository.save({
      ...body,
      applicantId:applicantRec.id,
    });

    return{
      message:'Create applicant skill successfully',
      result:applicantSkillRec,
    }
  }

  async updateSkill(id:number, body:UpsertApplicantDto,user:User){
    const applicantSkillRec = await this.applicantSkillRepository.findOneBy({
      id
    });

    const updateAppicantSkillRec = await this.applicantSkillRepository.save({
      ...applicantSkillRec,
      ...body,
    });

    return{
      message:'Update applicant skill successfully',
      result:updateAppicantSkillRec
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
    })

    return {
      message:'Get applicant skills successfully',
      result:applicantSkillRec,
    }
  }
  async getAllByManuscript(manuscriptId:number, user:User){
    // const manuscriptRec = await this.manuscriptRepository.findOne({
    //   where:{
    //     id:manuscriptId,
    //   },
    //   relations:['company'],
    // });

    // if(!manuscriptRec){
    //   throw new HttpException('Manuscript not found ', HttpStatus.NOT_FOUND);
    // }

    // if(manuscriptRec.company.userId !== user.id){
    //   throw new HttpException('Company not access ',HttpStatus.FORBIDDEN);
    // }

    // const result = await this.applicantRepository.find({
    //   where:{
    //     manuscriptId,
    //   },
    //   relations:['applicant']
    // });
  }
  
}
