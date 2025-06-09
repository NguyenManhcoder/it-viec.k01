
import { Module } from '@nestjs/common';
import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';

@Module({
  controllers: [IndustryController],
  providers:[IndustryService, IndustryRepository],
})
export class IndustryModule {}
