import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

export default function handleAxiosError(error: any) {
  console.error('API 요청에서 에러가 발생했습니다:', error);
  if (error.response) {
    // 서버 측에서 응답한 경우, 응답 코드에 따라 예외를 다르게 처리
    switch (error.response.status) {
      case 400:
        throw new BadRequestException('잘못된 요청입니다.');
      case 401:
        throw new UnauthorizedException('인증에 실패했습니다.');
      case 403:
        throw new ForbiddenException('접근이 거부되었습니다.');
      case 500:
        throw new InternalServerErrorException('서버 내부 오류입니다.');
      default:
        throw new InternalServerErrorException(
          '예상치 못한 오류가 발생했습니다.',
        );
    }
  } else {
    // 네트워크 오류 또는 요청 설정 오류
    throw new InternalServerErrorException(
      '네트워크 오류 또는 요청 설정이 잘못되었습니다.',
    );
  }
}
