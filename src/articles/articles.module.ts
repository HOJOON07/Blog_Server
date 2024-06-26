import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModel } from './entities/articles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticlesModel])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
