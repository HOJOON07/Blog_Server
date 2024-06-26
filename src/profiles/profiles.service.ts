import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileModel } from './entities/profiles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfileModel)
    private readonly profileReopsitory: Repository<ProfileModel>,
  ) {}
  async getProfileByName(name: string) {
    const existingProfileName = await this.profileReopsitory.exists({
      where: {
        name,
      },
    });

    return existingProfileName;
  }
}
