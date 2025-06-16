
import { Module } from '@nestjs/common';
import { ManuscriptController } from './manuscript.controller';
import { ManuscriptService } from './manuscript.service';
import { StorageService } from '../storage/storage.service';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { CompanyRepository } from 'src/databases/repositories/company.repository';

@Module({
  controllers: [ManuscriptController],
  providers:[
    ManuscriptService, 
    ManuscriptRepository,
    StorageService,
    CompanyRepository
  ],
})
export class ManuscriptModule {}
