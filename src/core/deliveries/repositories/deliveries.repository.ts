import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Delivery } from '../entities/delivery.entity';

@Injectable()
export class DeliveriesRepository extends AbstractRepository<Delivery> {
    constructor(
        @InjectRepository(Delivery)
        private readonly repo: Repository<Delivery>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
