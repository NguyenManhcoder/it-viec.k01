import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { IsStrongPassword } from "src/commons/decorators/is-strong-password.decorator";

export class RegisterUserDto{
    @ApiProperty({example: 'user'})
    @IsString()
    @IsNotEmpty()
    username:string;

    @ApiProperty({example: 'user'})
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @ApiProperty({example: 'user'})
    @IsStrongPassword()
    @IsNotEmpty()
    password:string;
}