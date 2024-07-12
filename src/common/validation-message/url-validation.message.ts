import { ValidationArguments } from 'class-validator';

export const UrlValidationMessage = (args: ValidationArguments) => {
  return `${args.property}에 정확한 url 형식을 입력해주세요.`;
};
