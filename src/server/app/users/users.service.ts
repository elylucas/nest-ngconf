import { Injectable } from '@nestjs/common';
import { User } from '../models/user.model';

@Injectable()
export class UsersService {
  users: User[] = [
    { id: 'user', name: 'Space Ranger Joe', roles: ['user'] },
    { id: 'admin', name: 'Space Admin Becka', roles: ['user', 'admin'] }
  ];

  getUser(id: string) {
    const user = this.users.find(x => x.id === id);
    return user;
  }
}
