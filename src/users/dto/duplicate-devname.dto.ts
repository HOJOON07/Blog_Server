import { IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';

export class DuplicateDevNameDto {
  @IsString()
  @Length(2, 15, { message: lengthValidationMessage })
  devName: string;
}
