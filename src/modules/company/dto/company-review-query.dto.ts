import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { 
    IsNumber, 
    IsOptional, 

} from "class-validator";
import { DEFAULT_LIMIT } from "src/constants/common";

export class companyReviewDto{
    @ApiProperty({ example: 10, required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit: number = DEFAULT_LIMIT;

    @ApiProperty({ example: 1, required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    cursor: number ;

}