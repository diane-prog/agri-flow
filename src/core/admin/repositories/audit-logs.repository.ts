import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogsRepository extends AbstractRepository<AuditLog> {
    constructor(
        @InjectRepository(AuditLog)
        private readonly repo: Repository<AuditLog>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
