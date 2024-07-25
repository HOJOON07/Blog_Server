import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/users.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserFollowersModel } from './entities/user-followers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, UserFollowersModel]),
    forwardRef(() => AuthModule),
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
