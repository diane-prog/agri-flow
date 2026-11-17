import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersRepository extends AbstractRepository<Order> {
    constructor(
        @InjectRepository(Order)
        private readonly repo: Repository<Order>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
