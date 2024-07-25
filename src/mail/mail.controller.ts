import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @IsPublic()
  async postCreateMailData(@Body() { email }: { email: string }) {
    await this.mailService.createAuthEmail(email);
    return email;
  }

  @Post('verify')
  @IsPublic()
  async postAuthNumberVerify(
    @Body() { email, authNumber }: { email: string; authNumber: string },
  ) {
    await this.mailService.authNumberAndEmailVerify(email, authNumber);
    return { message: '이메일 인증이 확인되었습니다.' };
  }

  @Get()
  @IsPublic()
  async getDB() {
    return this.mailService.getDb();
  }
}
