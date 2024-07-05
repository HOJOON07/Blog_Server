import { Column, Entity, OneToMany } from 'typeorm';
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
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class UserModel extends BaseModel {
  //이메일은 유니크한 값이어야 한다.
  @Column({
    unique: true,
  })
  @IsEmail({}, { message: EmailValidationMessage })
  email: string;

  @Column({ nullable: true })
  @IsString({ message: stringValidationMessage })
  @Length(8, 16, {
    message: lengthValidationMessage,
  })
  /**
   * 요청이 올 때.
   * front -> back => json데이터를 받아서 back에서 class instance를 찾아서 dto로 변환
   *
   * 응답이 올 때.
   * back -> front => class instance(dto)를 json으로 응답을 보내줌
   *
   * toClassOnly -> class instance로 변환될때만
   *
   * toPlainOnly -> plain object로 변환될때만
   *
   * 즉 비밀번호 같은 경우에는 요청은 받아야 되고, 응답이 나 갈때는 제외시켜주는 옵션이 필요함.
   */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    length: 15,
    unique: true,
    nullable: true,
  })
  @IsString()
  @Length(2, 15, { message: lengthValidationMessage })
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
  location: string;

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

  @Column({
    nullable: true,
  })
  company: string;

  // 존재하지 않는 프로퍼티를 만들어서 보내주고 싶다면 expose를 사용해서 보내줄 수 있다.
  // @Expose()
  // get devNameAndEmail() {
  //   return this.devName + '/' + this.email;
  // }
}
