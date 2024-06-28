import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { UserModel } from '../entities/users.entity';

export const User = createParamDecorator(
  (data: keyof UserModel | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as UserModel;

    if (!user) {
      throw new InternalServerErrorException(
        'User 데코레이터는 AccessTokenGuard와 함께 사용해야 합니다.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
