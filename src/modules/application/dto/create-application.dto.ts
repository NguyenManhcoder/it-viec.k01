import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

// update + insert

export class CreateApplicationDto{
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    name:string

    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    phone:string

    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    preferWorkLocation:string

    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    resume:string

    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    coverLetter:string

    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    manuscripId:number
}