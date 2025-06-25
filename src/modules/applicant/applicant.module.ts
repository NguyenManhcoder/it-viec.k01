
import { Module } from '@nestjs/common';
import { ApplicantController } from './applicant.controller';
import { ApplicantService } from './applicant.service';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { ApplicantSkillRepository } from 'src/databases/repositories/applicant-skill.repository';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';

@Module({
  controllers: [ApplicantController],
  providers:[
    ApplicantService,
    StorageService,
    ApplicantRepository,
    ApplicantSkillRepository,
    ManuscriptRepository,
  ],
})
export class ApplicantModule {}
