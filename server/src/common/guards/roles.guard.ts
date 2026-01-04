import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}
  async canActivate(context: ExecutionContext,): Promise<boolean>{
    const request= context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token = authorization?.split(' ')[1];
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    if (!token) {
      return false;
    }

    const decoded = await this.jwtService.verifyAsync(token);
    request.user = decoded;
    const user = request.user;
    if (!roles.includes(user.role)) {
      return false;
    }

    return true;
  }
}
