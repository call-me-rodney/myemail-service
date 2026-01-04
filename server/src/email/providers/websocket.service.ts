import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // Enable CORS so your client can connect
})
export class EmailGateway {
  @WebSocketServer()
  server: Server;

  // Broadcast to all connected clients
  sendNewEmailNotification(payload: any) {
    this.server.emit('new_email', payload);
  }

  // Emit to a specific user's room
  sendNewEmailNotificationToUser(userId: string, payload: any) {
    if (!userId) return;
    this.server.to(userId).emit('new_email', payload);
  }

  // Emit to multiple user rooms at once
  sendNewEmailNotificationToMany(userIds: string[], payload: any) {
    if (!userIds?.length) return;
    this.server.to(userIds).emit('new_email', payload);
  }

  // Allow a client to join its user-specific room after authenticating client-side
  @SubscribeMessage('join_user_room')
  handleJoinRoom(@MessageBody() userId: string, @ConnectedSocket() socket: Socket) {
    if (!userId || !socket) return;
    socket.join(userId);
  }
}