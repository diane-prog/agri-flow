import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
