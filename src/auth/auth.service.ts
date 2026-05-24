import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  logout() {
    return { message: 'Logged out successfully' };
  }
}
