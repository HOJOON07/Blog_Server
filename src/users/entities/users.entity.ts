import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { ArticlesModel } from 'src/articles/entities/articles.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import {
  IsEmail,
  IsString,
  Length,
  ValidationArguments,
} from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { EmailValidationMessage } from 'src/common/validation-message/email-validation.message';

@Entity()
export class UserModel extends BaseModel {
  //이메일은 유니크한 값이어야 한다.
  @Column({
    unique: true,
  })
  @IsEmail({}, { message: EmailValidationMessage })
  email: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(8, 15, {
    message: lengthValidationMessage,
  })
  password: string;

  @Column({
    length: 15,
    unique: true,
  })
  @IsString()
  @Length(2, 10, { message: lengthValidationMessage })
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
