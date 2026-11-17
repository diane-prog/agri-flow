import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { PurchaseRequest } from '../entities/purchase-request.entity';

@Injectable()
export class PurchaseRequestsRepository extends AbstractRepository<PurchaseRequest> {
    constructor(
        @InjectRepository(PurchaseRequest)
        private readonly repo: Repository<PurchaseRequest>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
