import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService:AuthService){}

  @Post('register')
  registerUser(@Body() body:RegisterUserDto){
    return this.authService.registerUser
  }
}
