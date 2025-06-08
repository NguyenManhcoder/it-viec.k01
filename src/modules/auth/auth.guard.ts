import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/commons/decorators/public.decorator';
import { ROLES_KEY } from 'src/commons/decorators/role.decorator';
import { ROLE } from 'src/commons/enums/user.enum';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService,
        private reflector: Reflector
    ){}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Check xem API co public khong

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    
    
    // Check xem user co thuoc he thong khong
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


    // Check role user
     const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // khong có vai trò nào được phép truy cập
    }

    // Lấy thông tin người dùng
    const { user } = context.switchToHttp().getRequest();
    console.log(user)

    // Kiểm tra xem người dùng có ít nhất một trong các vai trò yêu cầu hay không
    const result = requiredRoles.some((role) => user.role?.includes(role));

    return result;
  }

  private extractTokenFromHeader(request: Request){
    const authHeader = request.headers['authorization'];
    const [type, token] = authHeader?.split(" ") ?? [];
    
    return type === 'Bearer' ? token : undefined
  }
}
