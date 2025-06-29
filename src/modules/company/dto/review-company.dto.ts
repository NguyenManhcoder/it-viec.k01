import { ApiProperty } from "@nestjs/swagger";
import { 
    IsNumber, 
    IsOptional, 
    IsString, 
    Max, 
    Min

} from "class-validator";

export class reviewCompanyDto{
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    conpanyId:number;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    rate:number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    title:string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    review:string;

}