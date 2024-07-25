import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { ChatMessagesService } from './messages/messages.service';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exceptionfilter';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socket-bearer-token.guard';
import { UserModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  // ws://localhost:5500/chats
  namespace: 'chats',
  cors: { origin: '*' },
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatsService,
    private readonly chatMessagesService: ChatMessagesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    console.log(`after gateway init`);
  }
  async handleConnection(socket: Socket & { user: UserModel }) {
    console.log(`on connect call : ${socket.id}`);

    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (err) {
      socket.disconnect();
    }
  }
  handleDisconnect(socket: Socket) {
    console.log(`on disconnet called :${socket.id}`);
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UserModel },
  ) {
    const chat = await this.chatService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('enter_chat')
  //방의 Chat ID들을 리스트로 받는다.
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UserModel },
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatService.checkIfChatsExists(chatId);

      if (!exists) {
        throw new WsException({
          message: `존재하지 않는 chat입니다. chatId:${chatId}`,
        });
      }
    }

    // for (const chatId of data) {
    //   socket.join(chatId.toString());
    // }
    socket.join(data.chatIds.map((chatId) => chatId.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UserModel },
  ) {
    const chatExists = await this.chatService.checkIfChatsExists(dto.chatId);

    if (!chatExists) {
      throw new WsException(
        `존재하지 않는 채팅방입니다. Chat ID : ${dto.chatId}`,
      );
    }

    const message = await this.chatMessagesService.createMessage(
      dto,
      socket.user.id,
    );
    // 1. 방에 들어가 있는 사용자한테만 보낼 수 있다.
    // this.server
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);

    // 2. 나를 제외한 사용자에게 보내는 것. broadCasting
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
  //
}
