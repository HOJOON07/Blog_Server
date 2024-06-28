import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import {
  ArticlePrivateStateEnums,
  ArticlePublishStateEnums,
} from '../const/article-state';
import { IsEnum, IsNumber, IsString, isString } from 'class-validator';

@Entity()
export class ArticlesModel extends BaseModel {
  @ManyToOne(() => UserModel, (user) => user.articles, {
    nullable: false,
  })
  author: UserModel;

  @Column({ nullable: true })
  @IsString()
  thumbnail: string;

  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  description: string;

  @Column()
  @IsString()
  contents: string;

  @Column({
    nullable: false,
    default: 0,
  })
  @IsNumber()
  likeCount: number;

  @Column({
    nullable: false,
    default: 0,
  })
  @IsNumber()
  commentCount: number;

  @Column({
    type: 'enum',
    enum: Object.values(ArticlePrivateStateEnums),
    default: ArticlePrivateStateEnums.Private,
  })
  @IsEnum(ArticlePrivateStateEnums)
  @IsString()
  isPrivate: ArticlePrivateStateEnums;

  @Column({
    type: 'enum',
    enum: Object.values(ArticlePublishStateEnums),
    default: ArticlePublishStateEnums.Temporary,
  })
  @IsEnum(ArticlePublishStateEnums)
  @IsString()
  isPublish: ArticlePublishStateEnums;
}
