import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AwsS3UploadService } from './aws_s3_upload.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE } from './const/max-file-size';
import { User } from 'src/users/decorator/user.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { DataSource, QueryRunner as QR } from 'typeorm';

@Controller('aws-s3-upload')
export class AwsS3UploadController {
  constructor(
    private readonly awsS3UploadService: AwsS3UploadService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('file')
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  async postUploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE, // 10MB
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @QueryRunner() qr: QR,
    @Body('isPublic') isPublic: string,
    @User('id') userId: number,
    @Body('type') type?: string,
  ) {
    const isPublicBool = isPublic === 'true' ? true : false;
    const imageType = type === 'profile' ? 'user' : 'article';
    return this.awsS3UploadService.uploadSingleFile({
      file,
      userId,
      isPublic: isPublicBool,
      imageType,
      qr,
    });
  }

  @Get(':key')
  async getFileKey(@Param('key') key: string) {
    return this.awsS3UploadService.getFileUrl(key);
  }

  @Post(':key')
  async deleteFile(@Param('key') key: string) {
    return this.awsS3UploadService.deleteFile(key);
  }
}
