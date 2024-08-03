import { Module } from '@nestjs/common';
import { AwsS3UploadService } from './aws_s3_upload.service';
import { AwsS3UploadController } from './aws_s3_upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/users/entities/users.entity';
import { ArticlesModel } from 'src/articles/entities/articles.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, ArticlesModel]), UsersModule],
  controllers: [AwsS3UploadController],
  providers: [AwsS3UploadService],
})
export class AwsS3UploadModule {}
