import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Listing } from '../entities/listing.entity';

@Injectable()
export class ListingsRepository extends AbstractRepository<Listing> {
    constructor(
        @InjectRepository(Listing)
        private readonly repo: Repository<Listing>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
