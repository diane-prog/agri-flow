import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { OfferRevision } from '../entities/offer-revision.entity';

@Injectable()
export class OfferRevisionsRepository extends AbstractRepository<OfferRevision> {
    constructor(
        @InjectRepository(OfferRevision)
        private readonly repo: Repository<OfferRevision>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
