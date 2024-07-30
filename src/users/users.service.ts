import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { GithubBasicInfoUserDto } from 'src/auth/dto/register-github.dto';
import { RegisterGithubUserDto } from 'src/auth/dto/register-user.dto';
import { DuplicateDevNameDto } from './dto/duplicate-devname.dto';
import { UserProfileEditDto } from './dto/user-profiles-edit.dto';
import { UserFollowersModel } from './entities/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserModel>(UserModel)
      : this.userRepository;
  }

  getUserFollowRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

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
      // 여기서 devName 생성해줘야 된다.
      devName,
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
        // 'readme',
        'followerCount',
        'followeeCount',
      ],
      where: { devName },
    });

    return userData;
  }

  async duplicateGetDevName(id: number, { devName }: DuplicateDevNameDto) {
    const currentUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!currentUser) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (currentUser.devName === devName) {
      return { message: '현재 사용하고 있는 데브월드 이름입니다.' };
    }

    const duplicated = await this.userRepository.exists({
      where: {
        devName,
      },
    });
    if (duplicated) {
      throw new BadRequestException('이미 존재하는 데브월드 이름입니다.');
    }

    return { message: '사용 가능한 데브월드 이름입니다.' };
  }

  async userProfileEdit(id: number, userProfileEditDto: UserProfileEditDto) {
    const userProfileData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userProfileData) {
      throw new NotFoundException('사용자 정보가 존재하지 않습니다.');
    }

    const {
      devName,
      bio,
      position,
      github,
      linkedin,
      instagram,
      socialEtc,
      email,
      location,
    } = userProfileEditDto;

    Object.assign(userProfileData, {
      devName,
      bio,
      position,
      github,
      linkedin,
      instagram,
      socialEtc,
      email,
      location,
    });

    const newUserProfile = await this.userRepository.save(userProfileData);

    return newUserProfile;
  }

  async UserReadmeEdit(id: number, readme: string) {
    const userProfileData = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!userProfileData) {
      throw new Error('유저의 정보가 없습니다.!!');
    }
    userProfileData.readme = readme;

    const newReadmeProfileData =
      await this.userRepository.save(userProfileData);

    return newReadmeProfileData;
  }

  async getUserOverview(devName: string) {
    const userProfileReadMeData = await this.userRepository.findOne({
      select: ['readme', 'github'],
      where: { devName },
    });

    if (!userProfileReadMeData) {
      return null;
      // throw new Error('유저의 리드미 정보가 없습니다.!');
    }

    return userProfileReadMeData;
  }

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr);
    // follower: 팔로우 요청을 보내는 유저입니다. UserModel과 다대일(ManyToOne) 관계를 맺고 있습니다.
    // followee: 팔로우 요청을 받는 유저입니다. UserModel과 다대일(ManyToOne) 관계를 맺고 있습니다.

    const result = await userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });
    return true;
  }

  async getFollowers(userId: number, includeNotConfirmed: boolean) {
    // 로그인한 사용자의 id => userId
    const where = {
      followee: {
        id: userId,
      },
    };

    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }

    const result = await this.userFollowersRepository.find({
      // 팔로우 데이터 테이블에서 팔로우 당하고 있는 나의 정보를 찾는것.
      // 즉, followee 컬럼에서 내 id값들을 조회하고
      // follower 컬럼은 나를 팔로우하고 있는 유저의 id들이다.
      // result는 find메서드이기 때문에 데이터 배열이고 거기서 follower들의 데이터를 보내주면 나를
      // 팔로우하고 있는 유저의 정보를 리턴 해주는 것.
      where,
      relations: {
        follower: true,
        followee: true,
      },
    });
    // return result.map((user) => user.follower);
    return result.map((user) => ({
      id: user.follower.id,
      devName: user.follower.devName,
      email: user.follower.email,
      isConfirmed: user.isConfirmed,
    }));
  }

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowRepository(qr);
    const existingFollowRequest = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      },
    });
    if (!existingFollowRequest) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다.');
    }

    await this.userFollowersRepository.save({
      ...existingFollowRequest,
      isConfirmed: true,
    });
    return true;
  }

  async deleteFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr);
    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });
    return true;
  }

  async incrementFollowerCount(
    userId: number,
    fieldName: keyof Pick<UserModel, 'followerCount' | 'followeeCount'>,
    incrementCount: number,
    qr?: QueryRunner,
  ) {
    const usersRepository = this.getUsersRepository(qr);

    await usersRepository.increment(
      {
        id: userId,
      },
      fieldName,
      incrementCount,
    );
  }

  async decrementFollowerCount(
    userId: number,
    fieldName: keyof Pick<UserModel, 'followerCount' | 'followeeCount'>,
    decrementCount: number,
    qr?: QueryRunner,
  ) {
    const usersRepository = this.getUsersRepository(qr);

    await usersRepository.decrement(
      {
        id: userId,
      },
      fieldName,
      decrementCount,
    );
  }
}
