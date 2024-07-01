import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMailModel } from './entities/auth-email';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuthMailModel]), UsersModule],
  exports: [MailService],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
