import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { ProductTranslation } from '../entities/product-translation.entity';

@Injectable()
export class ProductTranslationsRepository extends AbstractRepository<ProductTranslation> {
    constructor(
        @InjectRepository(ProductTranslation)
        private readonly repo: Repository<ProductTranslation>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
