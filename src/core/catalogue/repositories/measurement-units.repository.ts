import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '../../../libs/database/abstract.repository';
import { MeasurementUnit } from '../entities/measurement-unit.entity';

@Injectable()
export class MeasurementUnitsRepository extends AbstractRepository<MeasurementUnit> {
    constructor(
        @InjectRepository(MeasurementUnit)
        private readonly repo: Repository<MeasurementUnit>,
        private readonly manager: EntityManager,
    ) {
        super(repo, manager);
    }
}
