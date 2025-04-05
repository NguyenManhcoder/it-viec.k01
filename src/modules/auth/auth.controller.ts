import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { loginDto } from './dtos/login.dto';
import { AuthGuard } from './dtos/auth.guard';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService:AuthService){}

    @UseGuards(AuthGuard)
    @Get()
    test(){
      return {
        message:'Oke',
      };
    }

  @Post('register')
  registerUser(@Body() body:RegisterUserDto){
    return this.authService.registerUser
  }

  @Post('login')
  login(@Body() body: loginDto){
    return this.authService.login
  }
}
