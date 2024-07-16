import { IsNumber, IsString } from 'class-validator';
import { ArticlesModel } from 'src/articles/entities/articles.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UserModel, (user) => user.articlesComments)
  author: UserModel;

  @ManyToOne(() => ArticlesModel, (article) => article.comments)
  article: ArticlesModel;

  @Column()
  @IsString()
  comment: string;

  @Column({
    default: 0,
  })
  @IsNumber()
  likeCount: number;
}
