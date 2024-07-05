import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { AuthMailModel } from './entities/auth-email';
import { UsersService } from 'src/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { response } from 'express';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(AuthMailModel)
    private readonly mailRepository: Repository<AuthMailModel>,
    private readonly userService: UsersService,
    private readonly sendMailService: MailerService,
  ) {}

  async getDb() {
    return await this.mailRepository.find({});
  }

  async deleteDB(id: string) {
    return await this.mailRepository.delete(id);
  }

  createEmailAuthNumber() {
    const authNumber = Math.floor(Math.random() * 1000000).toString();
    return authNumber.padStart(6, '0');
  }

  async createAuthEmail(email: string) {
    // 가입 되어 있는 유저에 대한 처리
    const registerdEmail = await this.userService.findEmail(email);

    if (registerdEmail) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const emailAuthNumber = this.createEmailAuthNumber();
    // 가입을 시도했지만 인증을 완료하지 않은 유저에 대한 처리
    const triedAuthEmail = await this.mailRepository.findOne({
      where: {
        email,
      },
    });

    if (triedAuthEmail) {
      triedAuthEmail.emailAuthNumber = emailAuthNumber;
      await this.mailRepository.save(triedAuthEmail);
      await this.sendEmail(email, emailAuthNumber);
    } else {
      // 인증 번호를 생성하고 email auth DB에 인증번호를 저장.
      const newAuthEmailData = this.mailRepository.create({
        email,
        emailAuthNumber,
      });
      await this.mailRepository.save(newAuthEmailData);
      await this.sendEmail(email, emailAuthNumber);
    }
  }

  async sendEmail(email: string, authNumber: string) {
    await this.sendMailService.sendMail({
      to: email,
      subject: '데브월드 회원가입 인증 메일입니다.',
      text: authNumber,
    });
  }

  async authNumberAndEmailVerify(email: string, authNumber: string) {
    const authEmail = await this.mailRepository.findOne({
      where: {
        email,
      },
    });
    if (!authEmail) {
      throw new BadRequestException('해당 이메일을 찾을 수 없습니다.');
    }

    if (authEmail.emailAuthNumber === authNumber) {
      return email;
    } else {
      throw new BadRequestException('인증번호를 확인할 수 없습니다.');
    }
  }
}
