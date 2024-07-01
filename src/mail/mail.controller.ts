import { Body, Controller, Get, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async postCreateMailData(@Body() { email }: { email: string }) {
    return this.mailService.createAuthEmail(email);
  }

  @Get()
  async getDB() {
    return this.mailService.getDb();
  }
}
