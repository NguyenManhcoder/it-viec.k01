
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { StorageService } from '../storage/storage.service';
import { CompanyReviewRepository } from 'src/databases/repositories/company-review.repository';
import { ManuscriptSaveRepository } from 'src/databases/repositories/manuscript-save.repository';

@Module({
  controllers: [CompanyController],
  providers:[
    CompanyService, 
    CompanyRepository,
    ManuscriptSaveRepository,
    StorageService,
    CompanyReviewRepository
  ],
})
export class CompanyModule {}
