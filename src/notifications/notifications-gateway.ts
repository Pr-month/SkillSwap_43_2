import { Injectable, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtSocketGuard } from '../auth/guards/ws-jwt.guard';
import { Socket, Server } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class NotificationsGateWay {
  @WebSocketServer() server: Server;

  private rooms = new Set<>();

  @UseGuards(JwtSocketGuard)
  handleConnect(@ConnectedSocket() client: Socket) {
    if (client.id) {
      this.handleDisconnect(client);
    }
    this.handleJoinRoom(client, this.rooms.get(client.id));
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    for (const [roomName, clients] of this.rooms) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.rooms.delete(roomName);
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket): void {
    const roomName: string = client.id;

    if (!this.rooms.has(roomName)) {
      this.rooms.add(roomName);
    }
    client.join(roomName);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @ConnectedSocket()
    client: Socket,
    payload: { roomName: string; message: string },
  ): void {
    const { roomName, message } = payload;
    client.to(roomName).emit('message', { sender: client.id, message });
  }
}
