import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ArticlesService } from 'src/articles/articles.service';
@Injectable()
export class ArticleExistsMiddleware implements NestMiddleware {
  constructor(private readonly articleService: ArticlesService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const articleId = req.params.articleId;

    if (!articleId) {
      throw new BadRequestException(
        'Article ID는 패스파라미터로 넣어줘야합니다.',
      );
    }

    const exists = await this.articleService.checkArticleExistById(
      parseInt(articleId),
    );

    if (!exists) {
      throw new BadRequestException(
        'Article ID에 해당하는 Article이 존재하지 않습니다.',
      );
    }

    next();
  }
}
