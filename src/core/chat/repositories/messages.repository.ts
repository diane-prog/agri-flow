import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessagesRepository extends AbstractRepository<Message> {
    constructor(
        @InjectRepository(Message)
        private readonly repo: Repository<Message>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
