import { InjectRepository } from '@nestjs/typeorm';
import { ArticlesModel } from 'src/articles/entities/articles.entity';
import { ImageModel } from 'src/common/entities/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateArticleThumbnailDto } from './create-thumbnail.dto';
import {
  ARTCILES_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from 'src/common/const/path.const';
import { promises } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { basename, join } from 'path';

export class ArticlesThumbnailService {
  constructor(
    @InjectRepository(ArticlesModel)
    private readonly thumbnailRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.thumbnailRepository;
  }

  async createArticleThumbnail(
    dto: CreateArticleThumbnailDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      // 파일 존재 여부 확인
      // 존재하지 않으면 에러를 던짐
      await promises.access(tempFilePath);
    } catch (err) {
      throw new BadRequestException('존재하지 않는 파일 입니다.');
    }

    const fileName = basename(tempFilePath);
    // 새로 이동할 포스트 폴더의 경로
    // public/articles/image.jpg
    const newPath = join(ARTCILES_IMAGE_PATH, fileName);

    const result = await repository.save({
      ...dto,
    });

    await promises.rename(tempFilePath, newPath);
    return result;
  }
}
