import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  async createUser(email: string, password: string, devName: string) {
    // name 중복을 찾아야 함.
    // exist() => 만약에 조건에 해당하는 값이 있으면 true반환

    const existingProfileName = await this.userRepository.exists({
      where: {
        devName,
      },
    });

    if (existingProfileName) {
      throw new BadGatewayException('이미 존재하는 데브월드 이름입니다.');
    }

    const existingEmail = await this.userRepository.exists({
      where: {
        email,
      },
    });

    if (existingEmail) {
      throw new BadRequestException('이미 존재하는 이메일 입니다.');
    }

    const newUser = this.userRepository.create({
      email,
      password,
      devName,
    });
    return await this.userRepository.save(newUser);
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async getAllUser() {
    return await this.userRepository.find({});
  }

  async findDevWorldName(devName: string) {
    return await this.userRepository.exists({
      where: {
        devName,
      },
    });
  }

  async findEmail(email: string) {
    return await this.userRepository.exists({
      where: {
        email,
      },
    });
  }
}
