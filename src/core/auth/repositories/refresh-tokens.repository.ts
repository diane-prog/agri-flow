import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokensRepository extends AbstractRepository<RefreshToken> {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly repo: Repository<RefreshToken>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
