import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    /**
     * 요청이 들어올 때 REQ 요청이 들어온 타임스탬프를 찍는다.
     * [REQ] {요청 path} {요청 시간}
     *
     * 요청이 끝날 때 응답이 나갈 때 다시 타임스탬프를 찍는다.
     * [RES] 요청path 응답 시간 얼마나 걸렸는지 ms
     */
    const request = context.switchToHttp().getRequest();
    const now = new Date();
    const path = request.originalUrl;
    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    // return next.handle()을 실행하는 순간
    // 라우트의 로직이 전부 실행되고 응답이 반환된다.
    // observable로

    return next.handle().pipe(
      // tap은 보는 함수
      tap((observable) =>
        console.log(
          `[RES] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()}`,
        ),
      ),

      // map은 반환해주는 함수.
      // map((observable) => {
      //   return {
      //     message: '응답이 변경되었습니다.',
      //     response: observable,
      //   };
      // }),
    );
  }
}
