import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  async createUser(email: string, password: string, name: string) {
    const user = this.userRepository.create({
      email,
      password,
      profile: {
        name,
      },
    });

    const newUser = await this.userRepository.save(user);

    return newUser;
  }

  async getAllUsers() {
    return await this.userRepository.find({});
  }
}
