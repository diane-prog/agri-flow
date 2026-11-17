import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { CategoryTranslation } from '../entities/category-translation.entity';

@Injectable()
export class CategoryTranslationsRepository extends AbstractRepository<CategoryTranslation> {
    constructor(
        @InjectRepository(CategoryTranslation)
        private readonly repo: Repository<CategoryTranslation>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
