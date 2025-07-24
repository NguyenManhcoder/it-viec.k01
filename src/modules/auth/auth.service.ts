import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { refreshTokenDto } from './dtos/refresh-token.dto';
import { User } from 'src/databases/entities/user.entity';
import { loginGoogleDto } from './dtos/login-google.dto';
import { OAuth2Client } from 'google-auth-library';
import { registerCompanyDto } from './dtos/register-company.dto';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { DataSource } from 'typeorm';
import { Company } from 'src/databases/entities/company.entity';
import { MailService } from '../mail/mail.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuthService {

    constructor (
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService,
        private readonly userRepository: UserRepository,
        private readonly applicantRepository: ApplicantRepository,
        private readonly companyRepository: CompanyRepository,
        private readonly dataSource: DataSource,
        private readonly mailService: MailService,
        @InjectQueue('mail-queue') private mailQueue: Queue,
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

    //create new user
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

    //send mail 
    // await this.mailService.sendMail(
    //     email,
    //     'Welcome to ITViec', 
    //     'welcome-applicant',
    //     {
    //     name:username,
    //     email:email,
    //     },
    // );

    // add job cho producer
    const job = await this.mailQueue.add('send-mail-applicant',{
        name:username,
        email:email,
    });

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

    async loginGoogle(body: loginGoogleDto){
        const { token } = body;

        const ggClientId = this.configService.get('google').clientId;
        const ggSecret = this.configService.get('google').clientSecret;

        const oAuth2Client = new OAuth2Client(ggClientId,ggSecret);
        const ggLoginTicket = await oAuth2Client.verifyIdToken({
            idToken: token,
            audience:ggClientId
        })

        const { email_verified,email,name } = ggLoginTicket.getPayload()
        if(!email_verified){
            throw new HttpException(
                'Email is not verified: ' + email,
                HttpStatus.FORBIDDEN,
            );
        }

        let userRecord = await this.userRepository.findOneBy({
            email:email,
            // loginType: LOGIN_TYPE.GOOGLE
        })

        // check xem email da dung de dang ki user chua
        if(userRecord && userRecord.loginType === LOGIN_TYPE.EMAIL){
            throw new HttpException(
                'Email user to register with email : ' + email,

                HttpStatus.FORBIDDEN
            )
        }

        // Neu khong ton tai thi tao user login with gg moi
        if (!userRecord){
            userRecord = await this.userRepository.save({
                email,
                username:name,
                loginType: LOGIN_TYPE.GOOGLE
            });
        }

        await this.applicantRepository.save({
            userId: userRecord.id
        })

     //gen ra cap token moi 
    const payload = this.getPayLoad(userRecord)
    const { accessToken, refreshToken} = await this.signToken(payload)   
        

    return {
                message:'Login with gg successfully',
                result:{
                    accessToken,
                    refreshToken,
                },
            };    

    }

    async registerCompany(body:registerCompanyDto) {
        const {
            username,
            email,
            password,
            companyName,
            companyAddress,
            companyWebsite,
        } = body;

        // check email exist

        const userRecord = await this.userRepository.findOneBy({email : email})
        if(userRecord){
            throw new HttpException('Emailis exist ',HttpStatus.BAD_REQUEST);
        }

        // hash password
        const hashPassword = await argon2.hash(password);

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction();

        try {

            // create new user
            const newUser = await this.dataSource.manager.save(User,{
            email,
            username,
            password:hashPassword,
            loginType:LOGIN_TYPE.EMAIL,
            role:ROLE.COMPANY,
            });

            // create company by user
            await this.dataSource.manager.save(Company,{
                userId: newUser.id,
                name: companyName,
                location: companyAddress,
                website: companyWebsite,
            })

            await queryRunner.commitTransaction();

            //send mail 
            // await this.mailService.sendMail(
            //     email,
            //     'Welcome to ITViec', 
            //     'welcome-company',
            //     {
            //     name:username,
            //     email:email,
            //     company: companyName,
            //     },
            // );

            // add job cho producer
            const job = await this.mailQueue.add('send-mail-company',{
                name:username,
                email:email,
                company: companyName,
            });

            return {
            message: 'Register hr successfully',
        };
        } catch (error) {
            await queryRunner.rollbackTransaction()
        } finally{
            await queryRunner.release();
        }

    }
}
