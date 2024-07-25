import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserModel } from 'src/users/entities/users.entity';
import { CommentsService } from '../comments.service';
import { RolesEnum } from 'src/users/const/roles.const';
@Injectable()
export class isCommentMineOrAdminGuaer implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}
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

    const commentId = request.params.commentId;

    const isOk = await this.commentsService.isCommentsMine(
      user.id,
      parseInt(commentId),
    );

    if (!isOk) {
      throw new UnauthorizedException('댓글을 삭제할 권한이 없습니다.');
    }

    return true;
  }
}
