import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from './decorator/user.decorator';

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

  /**
   * serialization => 직렬화 : 현재 시스템에서 사용되는 (NestJS) 데이터의 구조를 다른 시스템에서도 쉽게 사용 할 수 있는 포맷으로 변환
   * deseialization => 역직렬화
   */

  @Get()
  getAllUser() {
    return this.usersService.getAllUser();
  }

  @Delete('delete')
  deleteUser(@Body('email') email: string) {
    return this.usersService.deleteUser(email);
  }

  @Get('myinfo')
  @UseGuards(AccessTokenGuard)
  getReturnMyInfo(@User('id') userId: number, @Request() req) {
    return this.usersService.getMyInfo(userId);
  }

  @Get('info')
  getReturnUserInfo(@Query('devName') devName: string) {
    return this.usersService.getUserInfo(devName);
  }

  @Post('duplicate')
  // @UseGuards(AccessTokenGuard)
  postDuplicateDevName(@Body('devName') devName: string) {
    return this.usersService.duplicateGetDevName(devName);
  }

  // @Post("edit")
  // @UseGuards(AccessTokenGuard)
  // // eidt dtd짜야되고
  // postUserProfilesEdit(@Body()){

  // }
}
