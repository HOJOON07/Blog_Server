import { IsString } from 'class-validator';
import { ChatsModel } from 'src/chats/entities/chats.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => ChatsModel, (chat) => chat.messages)
  chat: ChatsModel;

  @ManyToOne(() => UserModel, (user) => user.messages)
  author: UserModel;

  @Column()
  @IsString()
  message: string;
}
