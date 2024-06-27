import { UserModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ArticlesModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserModel, (user) => user.articles, {
    nullable: false,
  })
  author: UserModel;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  contents: string;

  @Column({
    nullable: false,
    default: 0,
  })
  likeCount: number;

  @Column({
    nullable: false,
    default: 0,
  })
  commentCount: number;

  @Column()
  isPrivate: boolean;

  @Column()
  isPublish: boolean;

  @Column('date')
  createdAt: Date;
}
