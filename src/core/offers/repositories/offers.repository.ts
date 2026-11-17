import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Offer } from '../entities/offer.entity';

@Injectable()
export class OffersRepository extends AbstractRepository<Offer> {
    constructor(
        @InjectRepository(Offer)
        private readonly repo: Repository<Offer>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
