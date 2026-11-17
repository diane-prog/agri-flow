import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UserRolesRepository extends AbstractRepository<UserRole> {
    constructor(
        @InjectRepository(UserRole)
        private readonly repo: Repository<UserRole>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
