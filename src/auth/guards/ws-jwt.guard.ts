import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig, jwtConfig } from '../../config/jwt.config';

@Injectable()
export class JwtSocketGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: JwtConfig,
  ) {}

  canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient();
      const token: string = client.handshake?.query?.token;
      if (!token) {
        throw new WsException('Missing authentication token');
      }
      const payload = this.jwtService.verify(token, {
        secret: this.jwtConfiguration.secret,
      });
      return payload;
    } catch () {
      throw new WsException('Invalid token');
    }
  }
}
