import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewsRepository extends AbstractRepository<Review> {
    constructor(
        @InjectRepository(Review)
        private readonly repo: Repository<Review>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
