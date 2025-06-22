import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';

import { User } from 'src/databases/entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
@Injectable() 
export class ApplicationService {

  constructor( 
    private readonly applicationRepository : ApplicationRepository ,
    private readonly manuscriptRepository : ManuscriptRepository ,
    private readonly applicantRepository : ApplicantRepository ,
    private readonly storageService : StorageService ,

  ){}

  async create(body : CreateApplicationDto, user: User){

    const manuscriptRec  = await this.manuscriptRepository.findOne({
      where:{
        id:body.manuscripId,
      },
    })  
    
    if(!manuscriptRec){
      throw new HttpException('Not found',HttpStatus.NOT_FOUND)
    }

    const applicant = await this.applicantRepository.findOne({
      where:{
        userId: user.id,
      }
    })

    // Validate file resume
    if(body.resume){
      await this.storageService.getSignedUrl(body.resume);
    }  


    const applicationRec = await this.applicationRepository.save({
      ...body,
      applicantId: applicant.id,
    }) ;
    
    return {
        message: 'Create application successfully',
        result:applicationRec
      }
  }

  async getAllByManuscript(manuscriptId:number, user:User){
    const manuscriptRec = await this.manuscriptRepository.findOne({
      where:{
        id:manuscriptId,
      },
      relations:['company'],
    });

    if(!manuscriptRec){
      throw new HttpException('Manuscript not found ', HttpStatus.NOT_FOUND);
    }

    if(manuscriptRec.company.userId !== user.id){
      throw new HttpException('Company not access ',HttpStatus.FORBIDDEN);
    }

    const result = await this.applicationRepository.find({
      where:{
        manuscriptId,
      },
      relations:['applicant']
    });
  }
  
}
