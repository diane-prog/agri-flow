import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsRepository extends AbstractRepository<Notification> {
    constructor(
        @InjectRepository(Notification)
        private readonly repo: Repository<Notification>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
