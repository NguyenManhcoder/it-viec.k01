
import { Module } from '@nestjs/common';
import { ManuscriptController } from './manuscript.controller';
import { ManuscriptService } from './manuscript.service';
import { StorageService } from '../storage/storage.service';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { ManuscriptSkillRepository } from 'src/databases/repositories/manuscript-skill.repository';
import { RedisService } from '../redis/redis.service';
import { ManuscriptViewRepository } from 'src/databases/repositories/manuscript-view.repository';

@Module({
  controllers: [ManuscriptController],
  providers:[
    ManuscriptService, 
    ManuscriptRepository,
    StorageService,
    CompanyRepository,
    ManuscriptSkillRepository,
    RedisService,
    ManuscriptViewRepository,
  ],
})
export class ManuscriptModule {}
