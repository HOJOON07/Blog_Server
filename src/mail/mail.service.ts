import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { AuthMailModel } from './entities/auth-email';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(AuthMailModel)
    private readonly mailRepository: Repository<AuthMailModel>,
    private readonly userService: UsersService,
  ) {}

  async getDb() {
    return await this.mailRepository.find({});
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
      return await this.mailRepository.save(triedAuthEmail);
    }
    // 인증 번호를 생성하고 email auth DB에 인증번호를 저장.
    const newAuthEmailData = this.mailRepository.create({
      email,
      emailAuthNumber,
    });
    await this.mailRepository.save(newAuthEmailData);

    return newAuthEmailData.email;
  }
}
