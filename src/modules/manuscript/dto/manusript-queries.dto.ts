import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { CommonQueryDto } from "src/commons/dtos/common-query.dto";
import { COMPANY_ADDRESS, COMPANY_TYPE } from "src/commons/enums/company.enum";
import { APPLICANT_LEVEL, WORKING_MODEL } from "src/commons/enums/manuscript.enum";

export class manuscriptQueriesDto extends CommonQueryDto {
    @ApiProperty({ required : false })
    @IsString()
    @IsOptional()
    keyword:string;

    @ApiProperty({
        example:COMPANY_ADDRESS.HA_NOI,
        enum:COMPANY_ADDRESS,
        required:false,
    })
    @IsEnum(COMPANY_ADDRESS)
    @IsOptional()
    companyAddress:COMPANY_ADDRESS;

    @ApiProperty({
        example:[APPLICANT_LEVEL.FRESHER],
        enum:APPLICANT_LEVEL,
        required:false,
        isArray:true,
    })
    @IsEnum(APPLICANT_LEVEL,{each : true})
    @IsOptional()
    @Transform(
        ({value}) => (Array.isArray(value) ? value : [value]).filter(Boolean)// loại bỏ tất cả các giá trị "falsy"(false, 0, "" (chuỗi rỗng), null, undefined, và NaN)
    )
    levels: APPLICANT_LEVEL[];

    @ApiProperty({
        example:[COMPANY_TYPE.HEADHUNT],
        enum:COMPANY_TYPE,
        required:false,
        isArray:true,
    })
    @IsEnum(COMPANY_TYPE, {each: true})
    @IsOptional()
    companyTypes: COMPANY_TYPE[];

    @ApiProperty({
        example:[WORKING_MODEL.AT_OFFICE],
        enum:WORKING_MODEL,
        required:false,
        isArray:true,
    })
    @IsEnum(WORKING_MODEL, {each:true})
    @IsOptional()
    @Transform(
        ({value}) => (Array.isArray(value) ? value : [value]).filter(Boolean)// loại bỏ tất cả các giá trị "falsy"(false, 0, "" (chuỗi rỗng), null, undefined, và NaN)
    )
    workingModel: WORKING_MODEL[];

    @ApiProperty({
        required:false,
        isArray:true,
        type: [Number]
    })
    @IsArray()
    @IsNumber({}, {each:true})
    @IsOptional()
    @Transform(
        ({value}) => (Array.isArray(value) ? value : [value])
        .filter(Boolean)
        .map((v)=>Number(v)//các phần tử trong mảng phài là number
        )
    )
    industryIds: number[];

    @ApiProperty({
        required:false,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({value})=>Number(value)) // vì trên url minSalary là string
    minSalary: number;

    @ApiProperty({
        required:false,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({value})=>Number(value))
    maxSalary: number;
}