import { Public } from "src/commons/decorators/public.decorator";
import { SkillService } from "./skill.service";
import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put, 
  Query
} from "@nestjs/common";
import { UpSertSkillDto } from "./dto/upsert-skill.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/commons/decorators/role.decorator";
import { ROLE } from "src/commons/enums/user.enum";
import { SkillQueriesDto } from "./dto/skill-query.dto";

@ApiBearerAuth()
@Controller('skill')
export class SkillController {
    constructor (private readonly skillService : SkillService){}

    // create update delete read

  @Roles(ROLE.ADMIN)
  @Post()
    create(@Body() body : UpSertSkillDto){
      return this.skillService.create(body)
    }
  
  @Roles(ROLE.ADMIN)
  @Put(':id')
    update(@Param('id') id:number ,@Body() body : UpSertSkillDto){
      return this.skillService.update(id,body)
    }

  @Public()
  @Get(':id')
    get(@Param('id') id:number ){
      return this.skillService.get(id)
    }

  @Roles(ROLE.ADMIN)
  @Delete(':id')
    delete(@Param('id') id:number ){
      return this.skillService.delete(id)
    }

  @Public()
  @Get()
    getAll (@Query() queries: SkillQueriesDto){
      return this.skillService.getAll(queries)
    }

}
