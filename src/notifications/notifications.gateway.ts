import { Injectable, UseGuards, Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { JwtSocketGuard } from '../auth/guards/ws-jwt.guard';
import { Socket, Server } from 'socket.io';
import { NotifyUserPayloadDto } from './dto/notify-user-payload.dto';
import { NotificationsService } from './notifications.service';
import { JwtConfig, jwtConfig } from '../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { TJwtPayload } from '../auth/auth.types';

@Injectable()
@WebSocketGateway({ crossOriginIsolated: true })
@UseGuards(JwtSocketGuard)
export class NotificationsGateway {
  constructor(
    private readonly server: Server,
    private readonly notificationsService: NotificationsService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: JwtConfig,
  ) {}

  @SubscribeMessage('connection')
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect(true);
        throw new WsException('Missing authentication token');
      }
      const payload: TJwtPayload = this.jwtService.verify(token, {
        secret: this.jwtConfiguration.secret,
      });
      const userId: string = payload.sub;

      await client.join(userId);
    } catch {
      throw new WsException('Connection error');
    }
  }

  notifyUser(clientId: string, payload: NotifyUserPayloadDto) {
    const notification = this.notificationsService.createNotification(payload);
    this.server.to(clientId).emit('notificateNewRequest', notification);
  }
}
