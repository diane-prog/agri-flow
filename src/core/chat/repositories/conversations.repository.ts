import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationsRepository extends AbstractRepository<Conversation> {
    constructor(
        @InjectRepository(Conversation)
        private readonly repo: Repository<Conversation>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
