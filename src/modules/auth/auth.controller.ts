import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { loginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { refreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { loginGoogleDto } from './dtos/login-google.dto';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService:AuthService){}

    @Get()
    test(){
      return {
        message:'Oke',
      };
    }

  @Public()
  @Post('register')
  registerUser(@Body() body:RegisterUserDto){
    return this.authService.registerUser(body);
  }

  @Public()
  @Post('login')
  login(@Body() body: loginDto){
    return this.authService.login(body)
  }
  
  @Public()
  @Post('refresh')
  refresh(@Body() body: refreshTokenDto){
    return this.authService.refresh(body)
  }

  @Public()
  @Post('login-google')
  loginGoogle(@Body() body: loginGoogleDto){
    return this.authService.loginGoogle(body)
  }
}
