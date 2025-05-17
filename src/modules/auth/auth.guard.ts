import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/commons/decorators/publish.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService,
        private reflector: Reflector
    ){}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // 💡 See this condition
      return true;
    }

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
