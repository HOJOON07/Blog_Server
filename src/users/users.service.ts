import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/users.entity';
import { Repository } from 'typeorm';
import { ProfileModel } from 'src/profiles/entities/profiles.entity';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { ProfilesService } from 'src/profiles/profiles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly profileService: ProfilesService,
  ) {}

  // async createUser(user: Pick<UserModel, 'email' | 'password'>,{name}:) {
  //   const user = this.userRepository.create({
  //     email,
  //     password,
  //     profile: {
  //       name,
  //     },
  //   });

  //   const newUser = await this.userRepository.save(user);

  //   return newUser;
  // }

  async createUser(email: string, password: string, name: string) {
    // name 중복을 찾아야 함.
    // exist() => 만약에 조건에 해당하는 값이 있으면 true반환

    const existingProfileName =
      await this.profileService.getProfileByName(name);

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
      profile: {
        name,
      },
    });
    return await this.userRepository.save(newUser);
  }

  async getAllUsers() {
    return await this.userRepository.find({});
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
}
