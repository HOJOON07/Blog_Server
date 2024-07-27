import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    console.log(request);

    // 트랜잭션과 관련되 모든 쿼리를 담당할
    // 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결한다.
    await qr.connect();
    // 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜잭션 안에서 데이터베이스 액션을 실행 할 수 있다.
    await qr.startTransaction();

    request.queryRunner = qr;

    return next.handle().pipe(
      catchError(async (e) => {
        await qr.rollbackTransaction();
        await qr.release();

        throw new InternalServerErrorException('qr 인터널 에러', e.message);
      }),
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}