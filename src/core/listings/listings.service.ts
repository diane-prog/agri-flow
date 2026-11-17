import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ListingStatusEnum, UserRoleEnum } from '../../common/enum';
import { AgriculturalProductsRepository } from '../catalogue/repositories/agricultural-products.repository';
import { MeasurementUnitsRepository } from '../catalogue/repositories/measurement-units.repository';
import { LocationsRepository } from '../locations/repositories/locations.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Listing } from './entities/listing.entity';
import { ListingsRepository } from './repositories/listings.repository';

@Injectable()
export class ListingsService {
    constructor(
        private readonly listingsRepo: ListingsRepository,
        private readonly productsRepo: AgriculturalProductsRepository,
        private readonly locationsRepo: LocationsRepository,
        private readonly unitsRepo: MeasurementUnitsRepository,
        private readonly usersRepo: UsersRepository,
    ) {}

    /**
     * Publie une nouvelle annonce d'offre agricole.
     */
    async create(sellerId: string, dto: CreateListingDto): Promise<Listing> {
        const seller = await this.usersRepo.findById(sellerId, ['roles']);
        if (!seller) {
            throw new NotFoundException('Vendeur introuvable');
        }

        const product = await this.productsRepo.findById(dto.productId);
        if (!product) {
            throw new NotFoundException('Produit agricole introuvable');
        }

        const location = await this.locationsRepo.findById(dto.locationId);
        if (!location) {
            throw new NotFoundException('Lieu de collecte introuvable');
        }

        const unit = await this.unitsRepo.findById(dto.unitId);
        if (!unit) {
            throw new NotFoundException('Unité de mesure introuvable');
        }

        const listing = new Listing({
            sellerUser: seller,
            sellerOrganizationId: dto.sellerOrganizationId,
            product,
            location,
            unit,
            quantity: dto.quantity,
            reservedQuantity: 0,
            pricePerUnit: dto.pricePerUnit,
            currency: 'XOF',
            priceNegotiable: dto.priceNegotiable ?? true,
            availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : new Date(),
            availableUntil: dto.availableUntil ? new Date(dto.availableUntil) : undefined,
            description: dto.description,
            photos: dto.photos ?? [],
            harvestYear: dto.harvestYear,
            deliveryPossible: dto.deliveryPossible ?? false,
            qualityData: dto.qualityData ?? {},
            status: ListingStatusEnum.ACTIVE, // Activée directement pour le MVP
        });

        return await this.listingsRepo.create(listing);
    }

    /**
     * Recherche et filtres paginés des annonces.
     */
    async findAll(query: QueryListingDto) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.max(1, Math.min(100, query.limit ?? 20));
        const skip = (page - 1) * limit;

        const qb = this.listingsRepo
            .getRepository()
            .createQueryBuilder('listing')
            .leftJoinAndSelect('listing.sellerUser', 'seller')
            .leftJoinAndSelect('seller.roles', 'roles')
            .leftJoinAndSelect('listing.product', 'product')
            .leftJoinAndSelect('product.translations', 'prodTrans')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('category.translations', 'catTrans')
            .leftJoinAndSelect('listing.location', 'location')
            .leftJoinAndSelect('listing.unit', 'unit')
            .where('listing.deleted = :deleted', { deleted: false });

        if (query.status) {
            qb.andWhere('listing.status = :status', { status: query.status });
        } else {
            qb.andWhere('listing.status = :status', {
                status: ListingStatusEnum.ACTIVE,
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
            qb.andWhere('LOWER(location.department) = LOWER(:dept)', {
                dept: query.department,
            });
        }

        if (query.minPrice !== undefined) {
            qb.andWhere('listing.pricePerUnit >= :minPrice', {
                minPrice: query.minPrice,
            });
        }

        if (query.maxPrice !== undefined) {
            qb.andWhere('listing.pricePerUnit <= :maxPrice', {
                maxPrice: query.maxPrice,
            });
        }

        const [items, total] = await qb
            .orderBy('listing.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const data = items.map((l) => ({
            ...l,
            availableQuantity: Number(l.quantity) - Number(l.reservedQuantity),
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
     * Obtenir le détail d'une annonce.
     */
    async findById(id: string): Promise<any> {
        const listing = await this.listingsRepo.findOne({
            where: { id, deleted: false },
            relations: [
                'sellerUser',
                'product',
                'product.translations',
                'product.category',
                'location',
                'unit',
            ],
        });

        if (!listing) {
            throw new NotFoundException(`Annonce avec l'ID ${id} introuvable`);
        }

        return {
            ...listing,
            availableQuantity: Number(listing.quantity) - Number(listing.reservedQuantity),
        };
    }

    /**
     * Mise à jour d'une annonce par son propriétaire.
     */
    async update(listingId: string, userId: string, dto: UpdateListingDto): Promise<Listing> {
        const listing = await this.listingsRepo.findById(listingId);
        if (!listing) {
            throw new NotFoundException('Annonce introuvable');
        }

        this.checkOwnership(listing, userId);

        if (dto.quantity !== undefined) {
            if (dto.quantity < Number(listing.reservedQuantity)) {
                throw new BadRequestException(
                    `Impossible de réduire la quantité à ${dto.quantity} car ${listing.reservedQuantity} unités sont déjà réservées/engagées.`,
                );
            }
            listing.quantity = dto.quantity;
        }

        if (dto.locationId) {
            const location = await this.locationsRepo.findById(dto.locationId);
            if (!location) throw new NotFoundException('Lieu introuvable');
            listing.location = location;
        }

        if (dto.pricePerUnit !== undefined) listing.pricePerUnit = dto.pricePerUnit;
        if (dto.priceNegotiable !== undefined) listing.priceNegotiable = dto.priceNegotiable;
        if (dto.availableFrom) listing.availableFrom = new Date(dto.availableFrom);
        if (dto.availableUntil) listing.availableUntil = new Date(dto.availableUntil);
        if (dto.description !== undefined) listing.description = dto.description;
        if (dto.photos) listing.photos = dto.photos;
        if (dto.harvestYear !== undefined) listing.harvestYear = dto.harvestYear;
        if (dto.deliveryPossible !== undefined) listing.deliveryPossible = dto.deliveryPossible;
        if (dto.qualityData) listing.qualityData = dto.qualityData;

        return await this.listingsRepo.save(listing);
    }

    /**
     * Mettre en pause une annonce.
     */
    async pause(listingId: string, userId: string): Promise<Listing> {
        const listing = await this.listingsRepo.findById(listingId);
        if (!listing) throw new NotFoundException('Annonce introuvable');
        this.checkOwnership(listing, userId);

        listing.status = ListingStatusEnum.PAUSED;
        return await this.listingsRepo.save(listing);
    }

    /**
     * Publier / Réactiver une annonce.
     */
    async publish(listingId: string, userId: string): Promise<Listing> {
        const listing = await this.listingsRepo.findById(listingId);
        if (!listing) throw new NotFoundException('Annonce introuvable');
        this.checkOwnership(listing, userId);

        listing.status = ListingStatusEnum.ACTIVE;
        return await this.listingsRepo.save(listing);
    }

    /**
     * Suppression / Archivage d'une annonce.
     */
    async delete(listingId: string, userId: string): Promise<{ message: string }> {
        const listing = await this.listingsRepo.findById(listingId);
        if (!listing) throw new NotFoundException('Annonce introuvable');
        this.checkOwnership(listing, userId);

        if (Number(listing.reservedQuantity) > 0) {
            throw new BadRequestException(
                'Impossible de supprimer une annonce ayant des quantités actuellement réservées ou en cours de commande.',
            );
        }

        await this.listingsRepo.softDelete({ id: listingId });
        return { message: 'Annonce supprimée avec succès' };
    }

    // ─── RÉSERVATION ATOMIQUE DE STOCK (CŒUR TRANSACTIONNEL PRD) ───

    /**
     * Réserve atomiquement une quantité sur une annonce avec verrou pessimiste SQL.
     * Empêche tout double engagement de marchandise.
     */
    async reserveQuantity(
        listingId: string,
        quantityToReserve: number,
        customManager?: EntityManager,
    ): Promise<Listing> {
        const manager = customManager ?? this.listingsRepo.getManager();

        return await manager.transaction(async (tx) => {
            // Verrou pessimiste d'écriture SELECT ... FOR UPDATE
            const listing = await tx
                .createQueryBuilder(Listing, 'listing')
                .setLock('pessimistic_write')
                .where('listing.id = :id AND listing.deleted = false', { id: listingId })
                .getOne();

            if (!listing) {
                throw new NotFoundException(`Annonce ${listingId} introuvable pour la réservation`);
            }

            const currentReserved = Number(listing.reservedQuantity);
            const totalQty = Number(listing.quantity);
            const availableQty = totalQty - currentReserved;

            if (quantityToReserve > availableQty) {
                throw new BadRequestException(
                    `Stock insuffisant : ${availableQty} unités disponibles, mais ${quantityToReserve} demandées.`,
                );
            }

            listing.reservedQuantity = currentReserved + quantityToReserve;

            if (listing.reservedQuantity >= totalQty) {
                listing.status = ListingStatusEnum.RESERVED;
            }

            return await tx.save(listing);
        });
    }

    /**
     * Libère une quantité réservée (en cas de refus d'offre ou d'annulation de commande).
     */
    async releaseQuantity(
        listingId: string,
        quantityToRelease: number,
        customManager?: EntityManager,
    ): Promise<Listing> {
        const manager = customManager ?? this.listingsRepo.getManager();

        return await manager.transaction(async (tx) => {
            const listing = await tx
                .createQueryBuilder(Listing, 'listing')
                .setLock('pessimistic_write')
                .where('listing.id = :id AND listing.deleted = false', { id: listingId })
                .getOne();

            if (!listing) {
                throw new NotFoundException(`Annonce ${listingId} introuvable pour la libération`);
            }

            const currentReserved = Number(listing.reservedQuantity);
            listing.reservedQuantity = Math.max(0, currentReserved - quantityToRelease);

            // Si elle était réservée au maximum et qu'on libère du stock, repasser en ACTIVE
            if (listing.status === ListingStatusEnum.RESERVED && listing.reservedQuantity < Number(listing.quantity)) {
                listing.status = ListingStatusEnum.ACTIVE;
            }

            return await tx.save(listing);
        });
    }

    private checkOwnership(listing: Listing, userId: string) {
        if (listing.sellerUser?.id !== userId) {
            throw new ForbiddenException(
                'Vous n\'avez pas les droits nécessaires pour modifier cette annonce.',
            );
        }
    }
}
