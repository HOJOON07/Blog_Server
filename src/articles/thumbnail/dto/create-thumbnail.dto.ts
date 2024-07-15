import { PickType } from '@nestjs/mapped-types';
import { ImageModel } from 'src/common/entities/image.entity';

export class CreateArticleThumbnailDto extends PickType(ImageModel, [
  'path',
  'article',
  'order',
  'type',
]) {}
