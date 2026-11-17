import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { RequestFulfillment } from '../entities/request-fulfillment.entity';

@Injectable()
export class RequestFulfillmentsRepository extends AbstractRepository<RequestFulfillment> {
    constructor(
        @InjectRepository(RequestFulfillment)
        private readonly repo: Repository<RequestFulfillment>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
