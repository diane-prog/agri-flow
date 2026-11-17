import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { AgriculturalCategory } from '../entities/agricultural-category.entity';

@Injectable()
export class AgriculturalCategoriesRepository extends AbstractRepository<AgriculturalCategory> {
    constructor(
        @InjectRepository(AgriculturalCategory)
        private readonly repo: Repository<AgriculturalCategory>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
