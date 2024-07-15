import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { join } from 'path';
import { ARTCILES_IMAGE_PATH } from '../const/path.const';
import { ArticlesModel } from 'src/articles/entities/articles.entity';

export enum ImageModelType {
  ARTICLE_IMAGE,
}
@Entity()
export class ImageModel extends BaseModel {
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  @Column({
    enum: ImageModelType,
  })
  @IsString()
  @IsEnum(ImageModelType)
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.ARTICLE_IMAGE) {
      return `/${join(ARTCILES_IMAGE_PATH, value)}`;
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne((type) => ArticlesModel, (article) => article.thumbnails)
  article?: ArticlesModel;
}
