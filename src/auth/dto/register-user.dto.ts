import { PickType } from '@nestjs/mapped-types';
import { UserModel } from 'src/users/entities/users.entity';

export class RegisterUserDto extends PickType(UserModel, [
  'devName',
  'email',
  'password',
]) {}
