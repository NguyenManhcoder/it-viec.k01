import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { APPLICANT_LEVEL } from "src/commons/enums/manuscript.enum";

// update + insert

export class UpsertApplicantDto{
    @ApiProperty({required: false})
    @IsNumber()
    @IsNotEmpty()
    skillId:number;

    @ApiProperty({required: false, example:APPLICANT_LEVEL.FRESHER})
    @IsEnum(APPLICANT_LEVEL)
    @IsNotEmpty()
    level:APPLICANT_LEVEL;

    
}