import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { UserModel } from 'src/users/entities/users.entity';

export class GithubBasicInfoUserDto extends PartialType(UserModel) {
  @IsString()
  devName: string;

  @IsString()
  @IsOptional()
  github?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  socialEtc?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class GithubCodeDto {
  @IsString()
  readonly code: string;
}

// login = devName
// htmlurl = github
// location = location
// blog = socialEtc
// company = company
// bio = bio
