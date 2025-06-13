import { CompanyService } from "./company.service";
import { 
  Body, 
  Controller,
  Param, 
  Put, 
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/commons/decorators/role.decorator";
import { ROLE } from "src/commons/enums/user.enum";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { GetCurrentUser } from "src/commons/decorators/get-current-user.decorator";
import { User } from "src/databases/entities/user.entity";

@ApiBearerAuth()
@Controller('company')
export class CompanyController {
    constructor (private readonly companyService : CompanyService){}


  @Roles(ROLE.COMPANY)
  @Put(':id')
    update(@Param('id') id:number ,@Body() body : UpdateCompanyDto, @GetCurrentUser() user: User){
      return this.companyService.update(id,body,user)
    }


}
