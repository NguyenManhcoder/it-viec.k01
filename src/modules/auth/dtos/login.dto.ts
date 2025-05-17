import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { IsStrongPassword } from "src/commons/decorators/is-strong-password.decorator";

export class loginDto{
    @ApiProperty({example: 'user@gmail.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @ApiProperty({example: 'user'})
    @IsStrongPassword()
    @IsNotEmpty()
    password:string;
}