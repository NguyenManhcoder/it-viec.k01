import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { access } from 'fs';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { refreshTokenDto } from './dtos/refresh-token.dto';
import { User } from 'src/databases/entities/user.entity';

@Injectable()
export class AuthService {

        constructor (
            private readonly jwtService:JwtService,
            private readonly configService:ConfigService,
            private readonly userRepository: UserRepository,
            private readonly applicantRepository: ApplicantRepository
        ){}
  async registerUser(body:RegisterUserDto) {
    const { username, email, password } = body;

    // check email exist

    const userRecord = await this.userRepository.findOneBy({email : email})
    if(userRecord){
        throw new HttpException('Emailis exist ',HttpStatus.BAD_REQUEST);
    }

    // hash password
    const hashPassword = await argon2.hash(password);

    const newUser = await this.userRepository.save({
        email,
        username,
        password:hashPassword,
        loginType:LOGIN_TYPE.EMAIL,
        role:ROLE.APPLICANT,
    });

    // create applicant by user
    await this.applicantRepository.save({
        userId: newUser.id
    })

    return {
        message: 'Register user successfully',
    };

  }

  async login(body:loginDto) {
    const { email, password } = body;

    // check user exist

    const userRecord = await this.userRepository.findOneBy({email : email})
    if(!userRecord){
        throw new HttpException('Incorrect email address or password ',HttpStatus.UNAUTHORIZED);
    }

    // compare password

    const isPasswordValid = await  argon2.verify(userRecord.password,password)

    if(!isPasswordValid){
        throw new HttpException('Incorrect email address or password ',HttpStatus.UNAUTHORIZED);
    };

    const payload =  this.getPayLoad(userRecord)
    const { refreshToken, accessToken } = await this.signToken(payload)
    
    return {
        message:'Login successfully',
        result:{
            accessToken,
            refreshToken
        }
    }


}

    // async refresh(body: refreshTokenDto){
    //     const { refreshToken } = body;

    //     // verify xem rt co hop le khong
    //     const payloadRefreshToken = this.jwtService.signAsync(
    //         refreshToken,
    //         {
    //             secret:this.configService.get('jwtAuth').jwtRefreshTokenSecret,
    //         }
    //     )
    //     console.log(payloadRefreshToken)

    //     // const userRecord = this.userRepository.findOneBy({
    //     //     id: payloadRefreshToken.
    //     // })

    //     return{
    //         message:'Refresh token sucessfully',
    //         resullt:{
    //             accessToken: ' ',
    //             refreshToke:' ',
    //         }
    //     }
    // }


    async refresh(body: refreshTokenDto){
        const { refreshToken } = body;

        //verify xem rt co hop le khong
        const payloadRefreshToken = await this.jwtService.verifyAsync(
            refreshToken,
            {
                secret:this.configService.get('jwtAuth').jwtRefreshTokenSecret,
            },
        )
        
        console.log(payloadRefreshToken)

        const userRecord = await this.userRepository.findOneBy({
            id: payloadRefreshToken.id,
        });
        if(!userRecord){
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        }
        
        //gen ra cap token moi 
        const payload = this.getPayLoad(userRecord)
        const { accessToken, refreshToken: newRefreshToken} = await this.signToken(payload)
        

            return {
                message:'Refresh token successfully',
                result:{
                    accessToken,
                    refreshToken:newRefreshToken,
                },
            };

        }

    getPayLoad(user: User){
        return{
            id: user.id,
            username: user.username,
            loginType: user.loginType,
            role:user.role,
        }
    };

    async signToken(payload){

        const payloadRefreshToken = {
            id:payload.id
        }
        const accessToken = await this.jwtService.signAsync(
        payload,
        {
            secret: this.configService.get('jwtAuth').jwtTokenSecret,
            expiresIn:'24h',
        }
        );

        const refreshToken = await this.jwtService.signAsync(
        payloadRefreshToken,
            {
                secret: this.configService.get('jwtAuth').jwtRefreshTokenSecret,
                expiresIn:'7d'
            }
        );

    return{
        accessToken,
        refreshToken
    }
    }

}
