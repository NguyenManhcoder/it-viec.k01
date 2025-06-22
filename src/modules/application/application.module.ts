
import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { StorageService } from '../storage/storage.service';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

@Module({
  controllers: [ApplicationController],
  providers:[
    ApplicationService,
    ApplicationRepository,
    ManuscriptRepository,
    StorageService,
    ApplicantRepository,
  ],
})
export class ApplicationModule {}
