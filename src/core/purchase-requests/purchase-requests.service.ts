import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PurchaseRequestStatusEnum } from '../../common/enum';
import { AgriculturalProductsRepository } from '../catalogue/repositories/agricultural-products.repository';
import { MeasurementUnitsRepository } from '../catalogue/repositories/measurement-units.repository';
import { LocationsRepository } from '../locations/repositories/locations.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { QueryPurchaseRequestDto } from './dto/query-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { PurchaseRequestsRepository } from './repositories/purchase-requests.repository';

@Injectable()
export class PurchaseRequestsService {
    constructor(
        private readonly requestsRepo: PurchaseRequestsRepository,
        private readonly productsRepo: AgriculturalProductsRepository,
        private readonly locationsRepo: LocationsRepository,
        private readonly unitsRepo: MeasurementUnitsRepository,
        private readonly usersRepo: UsersRepository,
    ) {}

    /**
     * Crée une demande d'achat de denrées agricoles.
     */
    async create(
        buyerId: string,
        dto: CreatePurchaseRequestDto,
    ): Promise<PurchaseRequest> {
        const buyer = await this.usersRepo.findById(buyerId);
        if (!buyer) throw new NotFoundException('Acheteur introuvable');

        const product = await this.productsRepo.findById(dto.productId);
        if (!product) throw new NotFoundException('Produit agricole introuvable');

        const unit = await this.unitsRepo.findById(dto.unitId);
        if (!unit) throw new NotFoundException('Unité de mesure introuvable');

        let location: any;
        if (dto.locationId) {
            location = await this.locationsRepo.findById(dto.locationId);
        }

        let deliveryLocation: any;
        if (dto.deliveryLocationId) {
            deliveryLocation = await this.locationsRepo.findById(dto.deliveryLocationId);
        }

        const request = new PurchaseRequest({
            buyerUser: buyer,
            buyerOrganizationId: dto.buyerOrganizationId,
            product,
            location,
            deliveryLocation,
            quantity: dto.quantity,
            fulfilledQuantity: 0,
            unit,
            targetPrice: dto.targetPrice,
            currency: 'XOF',
            specifications: dto.specifications ?? {},
            description: dto.description,
            deliveryMode: dto.deliveryMode,
            requiredAt: dto.requiredAt ? new Date(dto.requiredAt) : undefined,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            status: PurchaseRequestStatusEnum.OPEN,
        });

        return await this.requestsRepo.create(request);
    }

    /**
     * Recherche et filtres paginés des demandes d'achat.
     */
    async findAll(query: QueryPurchaseRequestDto) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.max(1, Math.min(100, query.limit ?? 20));
        const skip = (page - 1) * limit;

        const qb = this.requestsRepo
            .getRepository()
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.buyerUser', 'buyer')
            .leftJoinAndSelect('buyer.roles', 'roles')
            .leftJoinAndSelect('request.product', 'product')
            .leftJoinAndSelect('product.translations', 'prodTrans')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('category.translations', 'catTrans')
            .leftJoinAndSelect('request.location', 'location')
            .leftJoinAndSelect('request.deliveryLocation', 'deliveryLocation')
            .leftJoinAndSelect('request.unit', 'unit')
            .where('request.deleted = :deleted', { deleted: false });

        if (query.status) {
            qb.andWhere('request.status = :status', { status: query.status });
        } else {
            qb.andWhere('request.status IN (:...statuses)', {
                statuses: [
                    PurchaseRequestStatusEnum.OPEN,
                    PurchaseRequestStatusEnum.PARTIALLY_FULFILLED,
                ],
            });
        }

        if (query.product) {
            qb.andWhere('(product.id = :prod OR product.code = :prod)', {
                prod: query.product,
            });
        }

        if (query.category) {
            qb.andWhere('(category.id = :cat OR category.code = :cat)', {
                cat: query.category,
            });
        }

        if (query.department) {
            qb.andWhere(
                '(LOWER(deliveryLocation.department) = LOWER(:dept) OR LOWER(location.department) = LOWER(:dept))',
                { dept: query.department },
            );
        }

        const [items, total] = await qb
            .orderBy('request.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const data = items.map((r) => ({
            ...r,
            remainingQuantity: Number(r.quantity) - Number(r.fulfilledQuantity),
        }));

        return {
            items: data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtenir le détail d'une demande d'achat.
     */
    async findById(id: string): Promise<any> {
        const request = await this.requestsRepo.findOne({
            where: { id, deleted: false },
            relations: [
                'buyerUser',
                'product',
                'product.translations',
                'product.category',
                'location',
                'deliveryLocation',
                'unit',
            ],
        });

        if (!request) {
            throw new NotFoundException(`Demande d'achat ${id} introuvable`);
        }

        return {
            ...request,
            remainingQuantity: Number(request.quantity) - Number(request.fulfilledQuantity),
        };
    }

    /**
     * Mise à jour d'une demande d'achat par son créateur.
     */
    async update(
        requestId: string,
        userId: string,
        dto: UpdatePurchaseRequestDto,
    ): Promise<PurchaseRequest> {
        const request = await this.requestsRepo.findById(requestId);
        if (!request) throw new NotFoundException('Demande introuvable');
        this.checkOwnership(request, userId);

        if (dto.quantity !== undefined) {
            if (dto.quantity < Number(request.fulfilledQuantity)) {
                throw new BadRequestException(
                    `Impossible de réduire la quantité demandée à ${dto.quantity} car ${request.fulfilledQuantity} unités sont déjà satisfaites.`,
                );
            }
            request.quantity = dto.quantity;
        }

        if (dto.deliveryLocationId) {
            const loc = await this.locationsRepo.findById(dto.deliveryLocationId);
            if (!loc) throw new NotFoundException('Lieu introuvable');
            request.deliveryLocation = loc;
        }

        if (dto.targetPrice !== undefined) request.targetPrice = dto.targetPrice;
        if (dto.specifications) request.specifications = dto.specifications;
        if (dto.description !== undefined) request.description = dto.description;
        if (dto.requiredAt) request.requiredAt = new Date(dto.requiredAt);
        if (dto.expiresAt) request.expiresAt = new Date(dto.expiresAt);

        return await this.requestsRepo.save(request);
    }

    /**
     * Liste les demandes d'achat créées par un utilisateur (acheteur).
     */
    async findByBuyer(buyerId: string): Promise<any[]> {
        const items = await this.requestsRepo.find({
            where: { buyerUser: { id: buyerId } as any, deleted: false },
            relations: [
                'product',
                'product.translations',
                'product.category',
                'location',
                'deliveryLocation',
                'unit',
            ],
            order: { createdAt: 'DESC' },
        });

        return items.map((r) => ({
            ...r,
            remainingQuantity: Number(r.quantity) - Number(r.fulfilledQuantity),
        }));
    }

    /**
     * Clôturer une demande d'achat.
     */
    async close(requestId: string, userId: string): Promise<PurchaseRequest> {
        const request = await this.requestsRepo.findById(requestId);
        if (!request) throw new NotFoundException('Demande introuvable');
        this.checkOwnership(request, userId);

        request.status = PurchaseRequestStatusEnum.CLOSED;
        return await this.requestsRepo.save(request);
    }

    /**
     * Annuler une demande d'achat.
     */
    async cancel(requestId: string, userId: string): Promise<PurchaseRequest> {
        const request = await this.requestsRepo.findById(requestId);
        if (!request) throw new NotFoundException('Demande introuvable');
        this.checkOwnership(request, userId);

        request.status = PurchaseRequestStatusEnum.CANCELLED;
        return await this.requestsRepo.save(request);
    }

    // ─── GESTION ATOMIQUE DE L'AGRÉGATION & SATISFACTION DE LA DEMANDE ───

    /**
     * Met à jour la quantité satisfaite suite à l'acceptation d'une offre.
     */
    async fulfillQuantity(
        requestId: string,
        quantityToFulfill: number,
        customManager?: EntityManager,
    ): Promise<PurchaseRequest> {
        const manager = customManager ?? this.requestsRepo.getManager();

        return await manager.transaction(async (tx) => {
            const request = await tx
                .createQueryBuilder(PurchaseRequest, 'req')
                .setLock('pessimistic_write')
                .where('req.id = :id AND req.deleted = false', { id: requestId })
                .getOne();

            if (!request) {
                throw new NotFoundException(`Demande d'achat ${requestId} introuvable`);
            }

            const currentFulfilled = Number(request.fulfilledQuantity);
            const totalQty = Number(request.quantity);
            const newFulfilled = currentFulfilled + quantityToFulfill;

            if (newFulfilled > totalQty) {
                throw new BadRequestException(
                    `L'allocation de ${quantityToFulfill} unités dépasse la quantité totale demandée (${totalQty}).`,
                );
            }

            request.fulfilledQuantity = newFulfilled;

            if (request.fulfilledQuantity >= totalQty) {
                request.status = PurchaseRequestStatusEnum.FULFILLED;
            } else {
                request.status = PurchaseRequestStatusEnum.PARTIALLY_FULFILLED;
            }

            return await tx.save(request);
        });
    }

    private checkOwnership(request: PurchaseRequest, userId: string) {
        if (request.buyerUser?.id !== userId) {
            throw new ForbiddenException(
                'Vous n\'avez pas les droits nécessaires pour modifier cette demande d\'achat.',
            );
        }
    }
}
