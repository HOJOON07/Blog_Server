import { ValidationArguments } from 'class-validator';

export const EmailValidationMessage = (args: ValidationArguments) => {
  return `${args.property}에 정확한 email 형식을 입력해주세요.`;
};
