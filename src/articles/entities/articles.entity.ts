import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import {
  ArticlePrivateStateEnums,
  ArticlePublishStateEnums,
} from '../const/article-state';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ImageModel } from 'src/common/entities/image.entity';
import { CommentsModel } from '../comments/entities/comment.entity';

@Entity()
export class ArticlesModel extends BaseModel {
  @ManyToOne(() => UserModel, (user) => user.articles, {
    nullable: false,
  })
  author: UserModel;

  // @Column({ nullable: true })
  // @Transform(
  //   ({ value }) => value && `/${join(ARTICLES_PUBLIC_IMAGE_PATH, value)}`,
  // )
  @IsString()
  @OneToMany((type) => ImageModel, (image) => image.article)
  thumbnails: ImageModel[];

  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  description: string;

  @Column({ nullable: true })
  @IsString()
  articleImage: string;

  ///컨텐츠
  @Column({ type: 'jsonb' })
  @IsArray()
  contents: any;
  ///컨텐츠

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

  @OneToMany(() => CommentsModel, (comments) => comments.article)
  comments: CommentsModel[];
}
