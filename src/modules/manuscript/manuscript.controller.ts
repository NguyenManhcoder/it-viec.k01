import { ManuscriptService } from "./manuscript.service";
import { 
  Body, 
  Controller,
  Delete,
  Param, 
  Post, 
  Put, 
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/commons/decorators/role.decorator";
import { ROLE } from "src/commons/enums/user.enum";
import { GetCurrentUser } from "src/commons/decorators/get-current-user.decorator";
import { User } from "src/databases/entities/user.entity";
import { UpsertManuscriptDto } from "./dto/upsert-manuscript.dto";

@ApiBearerAuth()
@Controller('manuscript')
export class ManuscriptController {
    constructor (private readonly manuscriptService : ManuscriptService){}


  @Roles(ROLE.COMPANY)
  @Post(':id')
    create(@Body() body : UpsertManuscriptDto, @GetCurrentUser() user: User){
      return this.manuscriptService.create(body,user)
    }

  @Roles(ROLE.COMPANY)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: UpsertManuscriptDto,
    @GetCurrentUser() user: User,
  ){
    return this.manuscriptService.update(id,body,user)
  }

  @Roles(ROLE.COMPANY)
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @GetCurrentUser() user: User,
  ){
    return this.manuscriptService.delete(id,user)
  }

}
