import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { UserModel } from 'src/users/entities/users.entity';
import { GithubBasicInfoUserDto } from './register-github.dto';

export class PickRegisterUserDto extends PickType(UserModel, [
  'devName',
  'email',
  'password',
]) {}

export class RegisterUserDto extends PickRegisterUserDto {
  @IsString()
  passwordConfirm: string;
}

export class RegisterGithubUserDto extends GithubBasicInfoUserDto {}
