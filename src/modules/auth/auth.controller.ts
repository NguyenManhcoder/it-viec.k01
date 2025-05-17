import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { loginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { refreshTokenDto } from './dtos/refresh-token.dto';

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
    return this.authService.registerUser(body);
  }

  @Post('login')
  login(@Body() body: loginDto){
    return this.authService.login(body)
  }
  @Post('refresh')
  refresh(@Body() body: refreshTokenDto){
    return this.authService.refresh(body)
  }
}
