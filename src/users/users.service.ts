import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/users.entity';
import { Repository } from 'typeorm';
import { GithubBasicInfoUserDto } from 'src/auth/dto/register-github.dto';
import { RegisterGithubUserDto } from 'src/auth/dto/register-user.dto';

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

  async deleteUser(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    const result = await this.userRepository.remove(user);

    return result;
  }

  async createGithubUser(user: RegisterGithubUserDto) {
    const { email, devName, ...rest } = user;
    // 주석 처리 이유. 이미 누군가 일반유저로 회원가입을 했고 사용하는 이름이 깃허브에서 가져온 이름과 같다면? 에러를 뱉는다.

    // const existingProfileName = await this.userRepository.exists({
    //   where: {
    //     devName: user.devName,
    //   },
    // });

    // if (existingProfileName) {
    //   throw new BadGatewayException('이미 존재하는 데브월드 이름입니다.');
    // }
    const existingEmail = await this.userRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (existingEmail) {
      throw new BadRequestException('이미 존재하는 이메일 입니다.');
    }

    const newUser = this.userRepository.create({
      email,
      ...rest,
    });
    return await this.userRepository.save(newUser);
  }

  async getMyInfo(userId: number) {
    const userData = await this.userRepository.findOne({
      select: [
        'id',
        'devName',
        'email',
        'bio',
        'email',
        'instagram',
        'linkedin',
        'location',
        'position',
        'role',
        'socialEtc',
        'github',
      ],
      where: { id: userId },
    });
    return userData;
  }

  async getUserInfo(devName: string) {
    const userData = await this.userRepository.findOne({
      select: [
        'id',
        'devName',
        'email',
        'bio',
        'email',
        'instagram',
        'linkedin',
        'location',
        'position',
        'role',
        'socialEtc',
        'github',
      ],
      where: { devName },
    });
    return userData;
  }

  async duplicateGetDevName(devName: string) {
    const duplicated = await this.userRepository.exists({
      where: {
        devName,
      },
    });
    if (duplicated) {
      throw new BadRequestException('이미 존재하는 데브월드 이름입니다.');
    }
  }
}
