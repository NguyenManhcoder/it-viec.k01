import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configs/configuration';
import { DatabaseModule } from './databases/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './ormconfig';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'process';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { MailModule } from './modules/mail/mail.module';
import { StorageModule } from './modules/storage/storage.module';
import { SkillModule } from './modules/skill/skill.module';
import { IndustryModule } from './modules/industries/industry.module';
import { CompanyModule } from './modules/company/company.module';
import { ManuscriptModule } from './modules/manuscript/manuscript.module';
import { RedisModule } from './modules/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationModule } from './modules/application/application.module';
import { ApplicantModule } from './modules/applicant/applicant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig),
    DatabaseModule,
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(ConfigService:ConfigService) =>({
        secret:ConfigService.get('jwtAuth').jwtTokenSecret,
      })
    }),
    MailModule,
    AuthModule,
    StorageModule,
    SkillModule,
    IndustryModule,
    CompanyModule,
    ManuscriptModule,
    RedisModule,
    ApplicationModule,
    ApplicantModule,
    
    //setup bullmq connect to redis
    BullModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(configService:ConfigService) =>({
        connection:{
          url:configService.get('redisUri'), 
        }
      })
    }),
  ],
  controllers: [AppController],
  providers: [AppService,{
    provide: APP_GUARD,
    useClass: AuthGuard,
  },],
})
export class AppModule {}
