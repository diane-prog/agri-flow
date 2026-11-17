import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Location } from '../entities/location.entity';

@Injectable()
export class LocationsRepository extends AbstractRepository<Location> {
    constructor(
        @InjectRepository(Location)
        private readonly repo: Repository<Location>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
