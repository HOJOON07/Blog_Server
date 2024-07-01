import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { EmailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Column, Entity } from 'typeorm';

@Entity()
export class AuthMailModel extends BaseModel {
  @Column({
    unique: true,
  })
  @IsEmail({}, { message: EmailValidationMessage })
  email: string;

  @Column()
  @IsString()
  @Length(6)
  emailAuthNumber: string;

  @Column({
    default: false,
  })
  @IsBoolean()
  authState: boolean;
}
