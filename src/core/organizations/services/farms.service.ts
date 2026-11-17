import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HarvestForecastStatusEnum, OrganizationRoleEnum } from '../../../common/enum';
import { AuditLog } from '../../admin/entities/audit-log.entity';
import { AgriculturalProduct } from '../../catalogue/entities/agricultural-product.entity';
import { MeasurementUnit } from '../../catalogue/entities/measurement-unit.entity';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { CreateHarvestForecastDto } from '../dto/create-harvest-forecast.dto';
import { UpdateFarmDto } from '../dto/update-farm.dto';
import { UpdateHarvestForecastDto } from '../dto/update-harvest-forecast.dto';
import { Farm } from '../entities/farm.entity';
import { HarvestForecast } from '../entities/harvest-forecast.entity';
import { OrganizationMember } from '../entities/organization-member.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class FarmsService {
    constructor(
        @InjectRepository(Farm)
        private readonly farmRepo: Repository<Farm>,
        @InjectRepository(HarvestForecast)
        private readonly forecastRepo: Repository<HarvestForecast>,
        @InjectRepository(Organization)
        private readonly organizationRepo: Repository<Organization>,
        @InjectRepository(OrganizationMember)
        private readonly memberRepo: Repository<OrganizationMember>,
        @InjectRepository(Location)
        private readonly locationRepo: Repository<Location>,
        @InjectRepository(AgriculturalProduct)
        private readonly productRepo: Repository<AgriculturalProduct>,
        @InjectRepository(MeasurementUnit)
        private readonly unitRepo: Repository<MeasurementUnit>,
        @InjectRepository(AuditLog)
        private readonly auditLogRepo: Repository<AuditLog>,
    ) {}

    async createFarm(user: User, dto: CreateFarmDto): Promise<Farm> {
        let org: Organization | undefined;
        if (dto.organizationId) {
            org = await this.organizationRepo.findOne({ where: { id: dto.organizationId } });
            if (!org) throw new NotFoundException(`Organisation ${dto.organizationId} introuvable`);

            // Verify user is a member of the organization
            const membership = await this.memberRepo.findOne({
                where: { organization: { id: dto.organizationId }, user: { id: user.id }, isActive: true },
            });
            if (!membership) {
                throw new ForbiddenException("Vous n'êtes pas membre de cette organisation.");
            }
        }

        let location: Location | undefined;
        if (dto.locationId) {
            location = await this.locationRepo.findOne({ where: { id: dto.locationId } });
            if (!location) throw new NotFoundException(`Localisation ${dto.locationId} introuvable`);
        }

        const farm = this.farmRepo.create({
            name: dto.name,
            ownerUser: user,
            organization: org,
            location,
            totalAreaHectares: dto.totalAreaHectares,
            soilType: dto.soilType,
            waterSource: dto.waterSource,
            primaryCommodities: dto.primaryCommodities ?? [],
            notes: dto.notes,
        });

        const savedFarm = await this.farmRepo.save(farm);

        await this.auditLogRepo.save(
            this.auditLogRepo.create({
                actorUser: user,
                action: 'FARM_CREATED',
                entityType: 'Farm',
                entityId: savedFarm.id,
                metadata: { name: savedFarm.name, area: savedFarm.totalAreaHectares },
            }),
        );

        return savedFarm;
    }

    async findFarmsByUser(userId: string): Promise<Farm[]> {
        return await this.farmRepo.find({
            where: { ownerUser: { id: userId } },
            relations: ['location', 'organization'],
        });
    }

    async findFarmsByOrganization(orgId: string): Promise<Farm[]> {
        return await this.farmRepo.find({
            where: { organization: { id: orgId } },
            relations: ['ownerUser', 'location'],
        });
    }

    async getFarmById(id: string): Promise<Farm> {
        const farm = await this.farmRepo.findOne({
            where: { id },
            relations: ['ownerUser', 'organization', 'location', 'harvestForecasts', 'harvestForecasts.product', 'harvestForecasts.unit'],
        });
        if (!farm) throw new NotFoundException(`Exploitation ${id} introuvable`);
        return farm;
    }

    async updateFarm(id: string, user: User, dto: UpdateFarmDto): Promise<Farm> {
        const farm = await this.getFarmById(id);

        const isOwner = farm.ownerUser.id === user.id;
        let isOrgAdmin = false;
        if (farm.organization) {
            const mem = await this.memberRepo.findOne({
                where: { organization: { id: farm.organization.id }, user: { id: user.id }, isActive: true },
            });
            if (mem && (mem.role === OrganizationRoleEnum.OWNER || mem.role === OrganizationRoleEnum.ADMIN)) {
                isOrgAdmin = true;
            }
        }

        if (!isOwner && !isOrgAdmin) {
            throw new ForbiddenException("Vous n'avez pas les droits pour modifier cette exploitation.");
        }

        if (dto.name !== undefined) farm.name = dto.name;
        if (dto.totalAreaHectares !== undefined) farm.totalAreaHectares = dto.totalAreaHectares;
        if (dto.soilType !== undefined) farm.soilType = dto.soilType;
        if (dto.waterSource !== undefined) farm.waterSource = dto.waterSource;
        if (dto.primaryCommodities !== undefined) farm.primaryCommodities = dto.primaryCommodities;
        if (dto.notes !== undefined) farm.notes = dto.notes;

        if (dto.locationId) {
            const loc = await this.locationRepo.findOne({ where: { id: dto.locationId } });
            if (!loc) throw new NotFoundException(`Localisation ${dto.locationId} introuvable`);
            farm.location = loc;
        }

        return await this.farmRepo.save(farm);
    }

    async addHarvestForecast(user: User, dto: CreateHarvestForecastDto): Promise<HarvestForecast> {
        const farm = await this.getFarmById(dto.farmId);

        const isOwner = farm.ownerUser.id === user.id;
        let isOrgMember = false;
        if (farm.organization) {
            const mem = await this.memberRepo.findOne({
                where: { organization: { id: farm.organization.id }, user: { id: user.id }, isActive: true },
            });
            if (mem) isOrgMember = true;
        }

        if (!isOwner && !isOrgMember) {
            throw new ForbiddenException("Vous ne pouvez pas ajouter une prévision de récolte pour cette ferme.");
        }

        const product = await this.productRepo.findOne({ where: { id: dto.productId } });
        if (!product) throw new NotFoundException(`Produit agricole ${dto.productId} introuvable`);

        const unit = await this.unitRepo.findOne({ where: { id: dto.unitId } });
        if (!unit) throw new NotFoundException(`Unité de mesure ${dto.unitId} introuvable`);

        const forecast = this.forecastRepo.create({
            farm,
            product,
            unit,
            cultivatedAreaHectares: dto.cultivatedAreaHectares,
            estimatedQuantity: dto.estimatedQuantity,
            expectedHarvestDate: new Date(dto.expectedHarvestDate),
            plantingDate: dto.plantingDate ? new Date(dto.plantingDate) : undefined,
            status: HarvestForecastStatusEnum.PLANNED,
            notes: dto.notes,
        });

        const saved = await this.forecastRepo.save(forecast);

        await this.auditLogRepo.save(
            this.auditLogRepo.create({
                actorUser: user,
                action: 'HARVEST_FORECAST_CREATED',
                entityType: 'HarvestForecast',
                entityId: saved.id,
                metadata: { farmId: farm.id, product: product.code, quantity: saved.estimatedQuantity },
            }),
        );

        return saved;
    }

    async findHarvestForecasts(query: { productId?: string; status?: HarvestForecastStatusEnum; farmId?: string }): Promise<HarvestForecast[]> {
        const qb = this.forecastRepo
            .createQueryBuilder('forecast')
            .leftJoinAndSelect('forecast.farm', 'farm')
            .leftJoinAndSelect('farm.location', 'location')
            .leftJoinAndSelect('forecast.product', 'product')
            .leftJoinAndSelect('forecast.unit', 'unit')
            .orderBy('forecast.expectedHarvestDate', 'ASC');

        if (query.productId) {
            qb.andWhere('forecast.productId = :productId', { productId: query.productId });
        }
        if (query.status) {
            qb.andWhere('forecast.status = :status', { status: query.status });
        }
        if (query.farmId) {
            qb.andWhere('forecast.farmId = :farmId', { farmId: query.farmId });
        }

        return await qb.getMany();
    }

    async updateHarvestForecast(
        forecastId: string,
        user: User,
        dto: UpdateHarvestForecastDto,
    ): Promise<HarvestForecast> {
        const forecast = await this.forecastRepo.findOne({
            where: { id: forecastId },
            relations: ['farm', 'farm.ownerUser', 'farm.organization'],
        });

        if (!forecast) throw new NotFoundException(`Prévision de récolte ${forecastId} introuvable`);

        const isOwner = forecast.farm.ownerUser.id === user.id;
        let isOrgAdmin = false;
        if (forecast.farm.organization) {
            const mem = await this.memberRepo.findOne({
                where: { organization: { id: forecast.farm.organization.id }, user: { id: user.id }, isActive: true },
            });
            if (mem && (mem.role === OrganizationRoleEnum.OWNER || mem.role === OrganizationRoleEnum.ADMIN)) {
                isOrgAdmin = true;
            }
        }

        if (!isOwner && !isOrgAdmin) {
            throw new ForbiddenException("Action non autorisée.");
        }

        if (dto.status !== undefined) forecast.status = dto.status;
        if (dto.estimatedQuantity !== undefined) forecast.estimatedQuantity = dto.estimatedQuantity;
        if (dto.expectedHarvestDate !== undefined) forecast.expectedHarvestDate = new Date(dto.expectedHarvestDate);
        if (dto.notes !== undefined) forecast.notes = dto.notes;

        return await this.forecastRepo.save(forecast);
    }
}
