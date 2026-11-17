import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Dispute } from '../entities/dispute.entity';

@Injectable()
export class DisputesRepository extends AbstractRepository<Dispute> {
    constructor(
        @InjectRepository(Dispute)
        private readonly repo: Repository<Dispute>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
