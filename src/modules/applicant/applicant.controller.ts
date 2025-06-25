import { ApplicantService } from "./applicant.service";
import { 
  Body, 
  Controller,
  Get,
  Param, 
  Post, 
  Put, 
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/commons/decorators/role.decorator";
import { ROLE } from "src/commons/enums/user.enum";
import { GetCurrentUser } from "src/commons/decorators/get-current-user.decorator";
import { User } from "src/databases/entities/user.entity";
import { UpdateApplicantDto } from "./dto/update-applicant.dto";
import { UpsertApplicantDto } from "./dto/upsert-applicant.dto";

@ApiBearerAuth()
@Controller('applicant')
export class ApplicantController {
    constructor (private readonly applicantService : ApplicantService){}


  @Roles(ROLE.APPLICANT)
  @Put(':id')
    create(@Body() body : UpdateApplicantDto, @GetCurrentUser() user: User){
      return this.applicantService.update(body,user)
    }

  @Roles(ROLE.APPLICANT)
  @Post('skills')
    createSkill(@Body() body : UpsertApplicantDto, @GetCurrentUser() user: User){
      return this.applicantService.createSkill(body,user)
    }

  @Roles(ROLE.APPLICANT)
  @Put('skills/:id')
    updateSkill
    (
    @Param('id') id:number,
    @Body() body : UpsertApplicantDto, 
    @GetCurrentUser() user: User,
  ){
      return this.applicantService.updateSkill(id,body,user)
    }

  @Roles(ROLE.APPLICANT)
  @Get('skills')
    getSkills(@GetCurrentUser() user: User){
      return this.applicantService.getSkills(user)
    }
}
