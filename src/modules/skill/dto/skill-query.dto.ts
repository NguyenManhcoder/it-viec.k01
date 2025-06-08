import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

// update + insert

export class SkillQueriesDto{
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    name:string
}