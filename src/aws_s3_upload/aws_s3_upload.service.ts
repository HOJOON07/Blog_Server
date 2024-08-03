import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticlesModel } from 'src/articles/entities/articles.entity';
import { UserModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { QueryRunner, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsS3UploadService {
  private client: S3Client;
  private bucketName = this.configService.get('AWS_S3_BUCKET_NAME');

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly userService: UsersService,
    @InjectRepository(ArticlesModel)
    private readonly articleRepository: Repository<ArticlesModel>,
  ) {
    const s3_region = this.configService.get('AWS_S3_REGION');

    if (!s3_region) {
      throw new Error('S3_REGION not found in environment variables');
    }

    this.client = new S3Client({
      region: s3_region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadSingleFile({
    file,
    userId,
    isPublic = true,
    imageType,
    qr,
  }: {
    file: Express.Multer.File;
    userId: number;
    isPublic: boolean;
    imageType: string;
    qr?: QueryRunner;
  }) {
    try {
      const exists = await this.userRepository.exists({
        where: {
          id: userId,
        },
      });
      if (!exists) {
        throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
      }

      const key = `${uuidv4()}`;
      const sanitizedFileName = encodeURIComponent(file.originalname);
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: isPublic ? 'public-read' : 'private',
        Metadata: {
          originalName: sanitizedFileName,
        },
      });

      const uploadResult = await this.client.send(command);
      if (imageType === 'user') {
        const updateProfile = await this.userService.userImageEdit(
          userId,
          key,
          qr,
        );
      }

      //여기서 유저 이미지 업데이트하는거 qr같이 넘겨주면 된다.

      return {
        url: isPublic
          ? (await this.getFileUrl(key)).url
          : (await this.getPresignedSignedUrl(key)).url,
        key,
        isPublic,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFileUrl(key: string) {
    return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
  }

  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const deleteResult = await this.client.send(command);

      return deleteResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPresignedSignedUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
