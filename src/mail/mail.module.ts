import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMailModel } from './entities/auth-email';
import { UsersModule } from 'src/users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthMailModel]),
    UsersModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: 'ghwns5909@gmail.com',
            pass: 'supv wpdk fyoa nihu',
          },
        },
        defaults: {
          from: 'DevWorld_NoReply@devworld.com',
        },
      }),
    }),
  ],
  exports: [MailService],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
