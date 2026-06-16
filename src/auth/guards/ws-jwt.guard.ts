import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig, jwtConfig } from '../../config/jwt.config';
import { Socket } from 'socket.io';
import { TJwtPayload } from '../auth.types';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtSocketGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: JwtConfig,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const client: Socket = context.switchToWs().getClient();
      const rawToken = client.handshake?.query?.token;

      const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
      if (!token) {
        throw new WsException('Missing authentication token');
      }
      const payload: TJwtPayload = this.jwtService.verify(token, {
        secret: this.jwtConfiguration.secret,
      });
      const user = await this.usersService.findById(payload.sub);

      return user ? true : false;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
