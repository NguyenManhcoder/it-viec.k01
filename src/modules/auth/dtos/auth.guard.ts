import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService
    ){}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const token = this.extractTokenFromHeader(request);

    if(!token){
        throw new UnauthorizedException();
    }
    // return validateRequest(request);

    try{

        const payload = await this.jwtService.verifyAsync(token,{
            secret:this.configService.get('jwtAuth').jwtTokenSecret,
        });

        request['user'] = payload;

    } catch{
        throw new UnauthorizedException()
    }

    return true;
  }

  private extractTokenFromHeader(request: Request){
    const authHeader = request.headers.get("authorization");
  const [type, token] = authHeader?.split(" ") ?? [];
    
    return type === 'Bearer' ? token : undefined
  }
}
