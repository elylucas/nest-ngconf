import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { User } from '../models/user.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    let token: string;
    let user: User;

    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer ')
    ) {
      token = request.headers.authorization.split(' ')[1];
      user = this.userService.getUser(token.replace('-token', ''));
      if (!user) {
        return false;
      }
      request.user = user;
    }

    const requiredRoles =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];

    if (requiredRoles.length === 0) {
      return true;
    } else if (!user) {
      return false;
    }

    const hasRole = user.roles.some(role => requiredRoles.indexOf(role) > -1);
    return hasRole;
  }
}
