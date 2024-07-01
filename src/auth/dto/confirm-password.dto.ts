import {
  IsEmail,
  IsString,
  Length,
  ValidationArguments,
} from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';

export class PasswordConfirmDto {
  @IsString()
  @Length(8, 15, {
    message: lengthValidationMessage,
  })
  password: string;

  @IsString()
  @Length(8, 15, {
    message: lengthValidationMessage,
  })
  passwordConfirm: string;
}
