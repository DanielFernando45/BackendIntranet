import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' }, // ⚠️ En prod: cámbialo por tu dominio front
})
export class NotificacionesGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('NotificacionesGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Cliente se une a su canal personal
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`🟢 Usuario unido a sala: ${data.room}`);
    client.emit('suscrito', { ok: true, room: data.room });
  }

  // Enviar notificación en tiempo real
  async emitirNotificacion(data: {
    idUsuario: number;
    mensaje: string;
    tipo: string;
    audiencia: string;
  }) {
    const room = `user-${data.idUsuario}`;
    this.server.to(room).emit('nuevaNotificacion', data);
    this.logger.log(`📤 Notificación enviada a ${room}: ${data.mensaje}`);
  }
}
