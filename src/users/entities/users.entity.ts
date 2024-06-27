import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { ArticlesModel } from 'src/articles/entities/articles.entity';

@Entity()
export class UserModel {
  @PrimaryGeneratedColumn()
  id: number;

  //이메일은 유니크한 값이어야 한다.
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    length: 15,
    unique: true,
  })
  devName: string;

  @Column({
    type: 'enum',
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => ArticlesModel, (articles) => articles.author)
  articles: ArticlesModel[];

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
