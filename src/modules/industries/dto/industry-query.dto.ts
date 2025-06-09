import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

// update + insert

export class IndustryQueriesDto{
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    name:string
}