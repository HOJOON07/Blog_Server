import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ArticlesService } from '../articles.service';
import { RolesEnum } from 'src/users/const/roles.const';
import { Request } from 'express';
import { UserModel } from 'src/users/entities/users.entity';
@Injectable()
export class IsArticleMineOrAdminGuard implements CanActivate {
  constructor(private readonly articleService: ArticlesService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request & {
      user: UserModel;
    };
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const articleId = request.params.articleId;

    if (!articleId) {
      throw new BadRequestException(
        'Article ID가 파라미터로 제공되어야 합니다.',
      );
    }

    const isOk = await this.articleService.isArticleMine(
      user.id,
      parseInt(articleId),
    );

    if (!isOk) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
    /**
     * Admin일 경우 그냥 패스
     */
  }
}
