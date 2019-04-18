import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (
      !request.headers.authorization ||
      !request.headers.authorization.startsWith('Bearer ')
    ) {
      return false;
    }

    const token = request.headers.authorization.split(' ')[1];

    const userRoles = [];

    if (token === 'user-token') {
      userRoles.push('user');
    }
    if (token === 'admin-token') {
      userRoles.push('user', 'admin');
    }

    const hasRole = userRoles.some(role => requiredRoles.indexOf(role) > -1);
    return hasRole;
  }
}
