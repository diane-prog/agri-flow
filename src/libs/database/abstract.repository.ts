import {
    EntityManager,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    In,
    Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AbstractEntity } from './abstract.entity';

export abstract class AbstractRepository<T extends AbstractEntity<T>> {
    protected constructor(
        protected readonly entityRepository: Repository<T>,
        protected readonly entityManager: EntityManager,
    ) {}

    /**
     * Gets the underlying repository.
     */
    getRepository(): Repository<T> {
        return this.entityRepository;
    }

    /**
     * Gets the entity manager.
     */
    getManager(): EntityManager {
        return this.entityManager;
    }

    /**
     * Counts the number of entities that match the provided conditions.
     */
    count(options?: FindManyOptions<T>): Promise<number> {
        return this.entityRepository.count(options);
    }

    /**
     * Finds entities that match the provided conditions.
     */
    find(options?: FindManyOptions<T>): Promise<T[]> {
        return this.entityRepository.find(options);
    }

    /**
     * Finds entities and returns them with the total count (pagination helper).
     */
    findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
        return this.entityRepository.findAndCount(options);
    }

    /**
     * Finds a single entity that matches the provided conditions.
     */
    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        return await this.entityRepository.findOne(options);
    }

    /**
     * Finds an entity by id.
     */
    async findById(id: string, relations?: string[]): Promise<T | null> {
        return await this.entityRepository.findOne({
            where: { id, deleted: false } as FindOptionsWhere<T>,
            relations,
        });
    }

    /**
     * Creates and persists a new entity.
     */
    create(entity: T): Promise<T> {
        return this.entityManager.save(entity);
    }

    /**
     * Persists an entity.
     */
    save(entity: T): Promise<T> {
        return this.entityManager.save(entity);
    }

    /**
     * Persists multiple entities.
     */
    async createMany(entities: T[]): Promise<T[]> {
        return await this.entityManager.save(entities);
    }

    /**
     * Updates an entity matching the provided conditions.
     */
    async update(
        where: FindOptionsWhere<T>,
        partialEntity: QueryDeepPartialEntity<T>,
    ): Promise<T | null> {
        await this.entityRepository.update(where, partialEntity);
        return this.findOne({ where });
    }

    /**
     * Hard-deletes an entity matching the provided conditions.
     */
    async delete(
        where: FindOptionsWhere<T>,
        message?: string | null,
    ): Promise<string | null> {
        await this.entityRepository.delete(where);
        return message ?? null;
    }

    /**
     * Hard-deletes multiple entities by identifier in a single query.
     */
    async deleteMany(ids: string[]): Promise<number> {
        if (ids.length === 0) {
            return 0;
        }

        const result = await this.entityRepository.delete({
            id: In(ids),
        } as FindOptionsWhere<T>);

        return result.affected ?? 0;
    }

    /**
     * Soft-deletes an entity matching the provided conditions.
     */
    async softDelete(
        where: FindOptionsWhere<T>,
        message?: string | null,
    ): Promise<string | null> {
        await this.entityRepository.softDelete(where);
        await this.entityRepository.update(where, {
            deleted: true,
        } as unknown as QueryDeepPartialEntity<T>);
        return message ?? null;
    }

    /**
     * Restores a soft-deleted entity matching the provided conditions.
     */
    async restore(
        where: FindOptionsWhere<T>,
        message?: string | null,
    ): Promise<string | null> {
        await this.entityRepository.restore(where);
        await this.entityRepository.update(where, {
            deleted: false,
        } as unknown as QueryDeepPartialEntity<T>);
        return message ?? null;
    }
}
