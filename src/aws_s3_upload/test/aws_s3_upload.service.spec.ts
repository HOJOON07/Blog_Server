import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3UploadService } from '../aws_s3_upload.service';

describe('AwsS3UploadService', () => {
  let service: AwsS3UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsS3UploadService],
    }).compile();

    service = module.get<AwsS3UploadService>(AwsS3UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
