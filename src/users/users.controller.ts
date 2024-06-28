import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

type AuthDTO = {
  email: string;
  password: string;
  name: string;
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  postCreateUser(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('devName') devName: string,
  ) {
    return this.usersService.createUser(email, password, devName);
  }

  @Get()
  /**
   * serialization => 직렬화 : 현재 시스템에서 사용되는 (NestJS) 데이터의 구조를 다른 시스템에서도 쉽게 사용 할 수 있는 포맷으로 변환
   * deseialization => 역직렬화
   */
  getAllUser() {
    return this.usersService.getAllUser();
  }

  @Get('email')
  getUserByEmailTest() {
    return this.usersService.getUserByEmail('token10@naver.com');
  }
}
