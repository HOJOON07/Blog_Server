import { ArticlesModel } from 'src/articles/entities/articles.entity';
import { UserModel } from 'src/users/entities/users.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProfileModel {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserModel, (user) => user.profile)
  user: UserModel;

  @OneToMany(() => ArticlesModel, (articles) => articles.author)
  articles: ArticlesModel[];

  @Column({
    length: 15,
    unique: true,
  })
  // 10을 넘으면 안됨.
  // 유일무이한 값이 되어야 한다.
  name: string;

  @Column({
    nullable: true,
  })
  position: string;

  @Column({
    nullable: true,
  })
  bio: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    nullable: true,
  })
  github: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  linkedin: string;

  @Column({
    nullable: true,
  })
  instagram: string;

  @Column({
    nullable: true,
  })
  socialEtc: string;
}
