import { Body, Controller, Delete, Get, Post, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { PasswordPipe } from 'src/auth/pipe/password.pipe';

type AuthDTO = {
  email: string;
  password: string;
  name: string;
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // @Post()
  // postCreateUser(
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  //   @Body('devName') devName: string,
  // ) {
  //   return this.usersService.createUser(email, password, devName);
  // }

  @Get()
  /**
   * serialization => 직렬화 : 현재 시스템에서 사용되는 (NestJS) 데이터의 구조를 다른 시스템에서도 쉽게 사용 할 수 있는 포맷으로 변환
   * deseialization => 역직렬화
   */
  getAllUser() {
    return this.usersService.getAllUser();
  }

  @Delete('delete')
  deleteUser(@Body('email') email: string) {
    return this.usersService.deleteUser(email);
  }
}
