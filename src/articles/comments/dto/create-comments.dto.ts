import { PickType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entities/comment.entity';

export class CreateCommentsDto extends PickType(CommentsModel, ['comment']) {}
