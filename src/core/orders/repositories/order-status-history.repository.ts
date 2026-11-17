import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { OrderStatusHistory } from '../entities/order-status-history.entity';

@Injectable()
export class OrderStatusHistoryRepository extends AbstractRepository<OrderStatusHistory> {
    constructor(
        @InjectRepository(OrderStatusHistory)
        private readonly repo: Repository<OrderStatusHistory>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
