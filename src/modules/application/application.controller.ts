import { ApplicationService } from "./application.service";
import { 
  Body, 
  Controller,
  Get,
  Param, 
  Put, 
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/commons/decorators/role.decorator";
import { ROLE } from "src/commons/enums/user.enum";
import { GetCurrentUser } from "src/commons/decorators/get-current-user.decorator";
import { User } from "src/databases/entities/user.entity";
import { CreateApplicationDto } from "./dto/create-application.dto";

@ApiBearerAuth()
@Controller('application')
export class ApplicationController {
    constructor (private readonly applicationService : ApplicationService){}


  @Roles(ROLE.APPLICANT)
  @Put(':id')
    update(@Body() body : CreateApplicationDto, @GetCurrentUser() user: User){
      return this.applicationService.create(body,user)
    }

  @Roles(ROLE.COMPANY)
  @Get('manuscript/:manuscriptId')
    getAllByManuscript(
      @Param('manuscriptId') manuscriptId : number,
      @GetCurrentUser() user :User
    ){
      return this.applicationService.getAllByManuscript(manuscriptId,user)
    }
}
