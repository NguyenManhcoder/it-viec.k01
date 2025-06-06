import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { IsStrongPassword } from "src/commons/decorators/is-strong-password.decorator";
import { COMPANY_ADDRESS } from "src/commons/enums/company.enum";

export class registerCompanyDto {
    @ApiProperty({example: 'user'})
    @IsString()
    @IsNotEmpty()
    username:string;
    
    @ApiProperty({example: 'user@gmail.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @ApiProperty({example: 'User@12345'})
    @IsStrongPassword()
    @IsNotEmpty()
    password:string;

    @ApiProperty({example: 'Panasonic'})
    @IsString()
    @IsNotEmpty()
    companyName:string;

    @ApiProperty({example: COMPANY_ADDRESS.HA_NOI})
    @IsEnum(COMPANY_ADDRESS)
    @IsNotEmpty()
    companyAddress:COMPANY_ADDRESS;

    @ApiProperty({example: 'https://itviec.com/'})
    @IsString()
    @IsNotEmpty()
    companyWebsite:string;
}