import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3UploadController } from './aws_s3_upload.controller';
import { AwsS3UploadService } from './aws_s3_upload.service';

describe('AwsS3UploadController', () => {
  let controller: AwsS3UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwsS3UploadController],
      providers: [AwsS3UploadService],
    }).compile();

    controller = module.get<AwsS3UploadController>(AwsS3UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
