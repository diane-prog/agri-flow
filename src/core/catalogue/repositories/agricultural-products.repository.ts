import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { AgriculturalProduct } from '../entities/agricultural-product.entity';

@Injectable()
export class AgriculturalProductsRepository extends AbstractRepository<AgriculturalProduct> {
    constructor(
        @InjectRepository(AgriculturalProduct)
        private readonly repo: Repository<AgriculturalProduct>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
