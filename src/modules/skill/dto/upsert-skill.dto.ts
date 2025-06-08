import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

// update + insert

export class UpSertSkillDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name:string
}