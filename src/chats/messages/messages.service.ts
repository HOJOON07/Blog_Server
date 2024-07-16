import { Injectable } from '@nestjs/common';
import { MessagesModel } from './entities/messages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';
import { CreateMessagesDto } from './dto/create-messages.dto';

export class ChatMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  async createMessage(dto: CreateMessagesDto, authorId: number) {
    const message = await this.messagesRepository.save({
      chat: { id: dto.chatId },
      author: {
        id: authorId,
      },
      message: dto.message,
    });
    return this.messagesRepository.findOne({
      where: { id: message.id },
      relations: { chat: true },
    });
  }

  async paginateMessages(
    dto: BasePaginationDto,
    overrideFindOptions: FindManyOptions<MessagesModel>,
  ) {
    return this.commonService.paginate(
      dto,
      this.messagesRepository,
      overrideFindOptions,
      'messages',
    );
  }
}
