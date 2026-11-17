import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OfferStatusEnum, TransactionModeEnum } from '../../common/enum';
import { AggregationService } from '../aggregation/aggregation.service';
import { MeasurementUnitsRepository } from '../catalogue/repositories/measurement-units.repository';
import { ListingsRepository } from '../listings/repositories/listings.repository';
import { ListingsService } from '../listings/listings.service';
import { OrdersService } from '../orders/orders.service';
import { PurchaseRequestsRepository } from '../purchase-requests/repositories/purchase-requests.repository';
import { PurchaseRequestsService } from '../purchase-requests/purchase-requests.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { CounterOfferDto } from './dto/counter-offer.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferRevision } from './entities/offer-revision.entity';
import { Offer } from './entities/offer.entity';
import { OfferRevisionsRepository } from './repositories/offer-revisions.repository';
import { OffersRepository } from './repositories/offers.repository';

@Injectable()
export class OffersService {
    constructor(
        private readonly offersRepo: OffersRepository,
        private readonly revisionsRepo: OfferRevisionsRepository,
        private readonly listingsRepo: ListingsRepository,
        private readonly requestsRepo: PurchaseRequestsRepository,
        private readonly unitsRepo: MeasurementUnitsRepository,
        private readonly usersRepo: UsersRepository,
        private readonly listingsService: ListingsService,
        private readonly requestsService: PurchaseRequestsService,
        private readonly ordersService: OrdersService,
        private readonly aggregationService: AggregationService,
    ) {}

    /**
     * Crée une nouvelle offre commerciale (soit en réponse à une annonce, soit à une demande d'achat).
     */
    async create(userId: string, dto: CreateOfferDto): Promise<Offer> {
        if (!dto.listingId && !dto.purchaseRequestId) {
            throw new BadRequestException(
                'Une offre doit obligatoirement cibler une annonce ou une demande d\'achat.',
            );
        }
        if (dto.listingId && dto.purchaseRequestId) {
            throw new BadRequestException(
                'Une offre ne peut pas cibler simultanément une annonce et une demande d\'achat.',
            );
        }

        const user = await this.usersRepo.findById(userId);
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        const unit = await this.unitsRepo.findById(dto.unitId);
        if (!unit) throw new NotFoundException('Unité de mesure introuvable');

        let listing: any;
        let purchaseRequest: any;
        let buyerUser: any;
        let sellerUser: any;

        if (dto.listingId) {
            listing = await this.listingsRepo.findById(dto.listingId, ['sellerUser']);
            if (!listing) throw new NotFoundException('Annonce introuvable');
            buyerUser = user;
            sellerUser = listing.sellerUser;

            if (buyerUser.id === sellerUser.id) {
                throw new BadRequestException('Vous ne pouvez pas faire une offre sur votre propre annonce.');
            }
        } else if (dto.purchaseRequestId) {
            purchaseRequest = await this.requestsRepo.findById(dto.purchaseRequestId, ['buyerUser']);
            if (!purchaseRequest) throw new NotFoundException('Demande d\'achat introuvable');
            sellerUser = user;
            buyerUser = purchaseRequest.buyerUser;

            if (sellerUser.id === buyerUser.id) {
                throw new BadRequestException('Vous ne pouvez pas répondre à votre propre demande d\'achat.');
            }
        }

        const offer = new Offer({
            listing,
            purchaseRequest,
            buyerUser,
            sellerUser,
            sellerOrganizationId: dto.sellerOrganizationId,
            quantity: dto.quantity,
            unit,
            unitPrice: dto.unitPrice,
            currency: dto.currency ?? 'XOF',
            transactionMode: dto.transactionMode ?? TransactionModeEnum.DIRECT,
            status: OfferStatusEnum.PENDING,
            notes: dto.notes,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        });

        const initialRevision = new OfferRevision({
            revisionNumber: 1,
            authorUser: user,
            quantity: dto.quantity,
            unitPrice: dto.unitPrice,
            currency: dto.currency ?? 'XOF',
            notes: dto.notes,
        });

        offer.revisions = [initialRevision];
        return await this.offersRepo.create(offer);
    }

    /**
     * Formule une contre-proposition sans jamais écraser l'historique de la négociation.
     */
    async counter(
        offerId: string,
        userId: string,
        dto: CounterOfferDto,
    ): Promise<Offer> {
        const offer = await this.offersRepo.findById(offerId, ['revisions', 'buyerUser', 'sellerUser']);
        if (!offer) throw new NotFoundException('Offre introuvable');

        this.checkParticipant(offer, userId);

        if (offer.status !== OfferStatusEnum.PENDING && offer.status !== OfferStatusEnum.COUNTERED) {
            throw new BadRequestException(
                `Impossible de faire une contre-offre sur une proposition au statut ${offer.status}`,
            );
        }

        const author = await this.usersRepo.findById(userId);
        const nextRevisionNumber = (offer.revisions?.length ?? 0) + 1;

        const revision = new OfferRevision({
            offer,
            revisionNumber: nextRevisionNumber,
            authorUser: author,
            quantity: dto.quantity,
            unitPrice: dto.unitPrice,
            currency: offer.currency,
            notes: dto.notes,
        });

        await this.revisionsRepo.create(revision);

        offer.quantity = dto.quantity;
        offer.unitPrice = dto.unitPrice;
        offer.notes = dto.notes;
        offer.status = OfferStatusEnum.COUNTERED;

        return await this.offersRepo.save(offer);
    }

    /**
     * Refuse une proposition commerciale.
     */
    async reject(offerId: string, userId: string): Promise<Offer> {
        const offer = await this.offersRepo.findById(offerId, ['buyerUser', 'sellerUser']);
        if (!offer) throw new NotFoundException('Offre introuvable');
        this.checkParticipant(offer, userId);

        offer.status = OfferStatusEnum.REJECTED;
        return await this.offersRepo.save(offer);
    }

    /**
     * Retire une proposition émise par soi-même.
     */
    async withdraw(offerId: string, userId: string): Promise<Offer> {
        const offer = await this.offersRepo.findById(offerId, ['buyerUser', 'sellerUser']);
        if (!offer) throw new NotFoundException('Offre introuvable');
        this.checkParticipant(offer, userId);

        offer.status = OfferStatusEnum.WITHDRAWN;
        return await this.offersRepo.save(offer);
    }

    /**
     * Accepte formellement une offre :
     * 1. Change le statut de l'offre en ACCEPTED.
     * 2. Réserve atomiquement le stock sur l'annonce si l'offre découle d'une annonce.
     * 3. Crée immédiatement la commande ferme (orders).
     * 4. Si l'offre découle d'une demande d'achat, met à jour fulfilled_quantity et enregistre request_fulfillments.
     */
    async accept(offerId: string, userId: string) {
        const offer = await this.offersRepo.findById(offerId, [
            'buyerUser',
            'sellerUser',
            'listing',
            'purchaseRequest',
            'unit',
            'revisions',
        ]);

        if (!offer) throw new NotFoundException('Offre introuvable');
        this.checkParticipant(offer, userId);

        if (offer.status !== OfferStatusEnum.PENDING && offer.status !== OfferStatusEnum.COUNTERED) {
            throw new BadRequestException(
                `Cette offre ne peut plus être acceptée (statut actuel : ${offer.status})`,
            );
        }

        // Exécution de la transaction complète
        return await this.offersRepo.getManager().transaction(async (tx) => {
            offer.status = OfferStatusEnum.ACCEPTED;
            await tx.save(offer);

            // 1. Si liée à une annonce, réservation atomique du stock
            if (offer.listing) {
                await this.listingsService.reserveQuantity(
                    offer.listing.id,
                    Number(offer.quantity),
                    tx,
                );
            }

            // 2. Création de la commande ferme
            const order = await this.ordersService.createFromOffer(offer, tx);

            // 3. Si liée à une demande d'achat, mise à jour de l'agrégation
            if (offer.purchaseRequest) {
                await this.requestsService.fulfillQuantity(
                    offer.purchaseRequest.id,
                    Number(offer.quantity),
                    tx,
                );

                await this.aggregationService.recordFulfillment(
                    offer.purchaseRequest,
                    offer,
                    order,
                    Number(offer.quantity),
                    tx,
                );
            }

            return {
                message: 'Offre acceptée avec succès. La commande a été générée.',
                offer,
                order,
            };
        });
    }

    async findById(offerId: string): Promise<Offer> {
        const offer = await this.offersRepo.findOne({
            where: { id: offerId, deleted: false },
            relations: [
                'buyerUser',
                'sellerUser',
                'listing',
                'purchaseRequest',
                'unit',
                'revisions',
                'revisions.authorUser',
            ],
        });

        if (!offer) throw new NotFoundException(`Offre ${offerId} introuvable`);
        return offer;
    }

    async findByUser(userId: string): Promise<Offer[]> {
        return await this.offersRepo.find({
            where: [
                { buyerUser: { id: userId } as any, deleted: false },
                { sellerUser: { id: userId } as any, deleted: false },
            ],
            relations: ['buyerUser', 'sellerUser', 'unit', 'listing', 'purchaseRequest'],
            order: { createdAt: 'DESC' },
        });
    }

    private checkParticipant(offer: Offer, userId: string) {
        if (offer.buyerUser?.id !== userId && offer.sellerUser?.id !== userId) {
            throw new ForbiddenException(
                'Vous ne participez pas à cette négociation commerciale.',
            );
        }
    }
}
