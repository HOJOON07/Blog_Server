import {
  BadRequestException,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModel } from './entities/articles.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entities/image.entity';
import { ArticlesThumbnailService } from './thumbnail/dto/thumbnail.service';
import { LogMiddleWare } from 'src/common/middleware/log.middleware';
import { UserModel } from 'src/users/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticlesModel, ImageModel, UserModel]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesThumbnailService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
