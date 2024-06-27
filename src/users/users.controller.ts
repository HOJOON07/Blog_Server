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
  getAllUser() {
    return this.usersService.getAllUser();
  }
}
