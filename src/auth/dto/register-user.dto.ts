import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { UserModel } from 'src/users/entities/users.entity';

export class PickRegisterUserDto extends PickType(UserModel, [
  'devName',
  'email',
  'password',
]) {}

export class RegisterUserDto extends PickRegisterUserDto {
  @IsString()
  passwordConfirm: string;
}
