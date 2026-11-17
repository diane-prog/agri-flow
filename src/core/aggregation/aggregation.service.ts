import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Offer } from '../offers/entities/offer.entity';
import { Order } from '../orders/entities/order.entity';
import { PurchaseRequest } from '../purchase-requests/entities/purchase-request.entity';
import { RequestFulfillment } from './entities/request-fulfillment.entity';
import { RequestFulfillmentsRepository } from './repositories/request-fulfillments.repository';

@Injectable()
export class AggregationService {
    constructor(
        private readonly fulfillmentsRepo: RequestFulfillmentsRepository,
    ) {}

    /**
     * Enregistre l'attribution d'une offre acceptée et de sa commande à une demande d'achat.
     */
    async recordFulfillment(
        purchaseRequest: PurchaseRequest,
        offer: Offer,
        order: Order,
        quantity: number,
        customManager?: EntityManager,
    ): Promise<RequestFulfillment> {
        const manager = customManager ?? this.fulfillmentsRepo.getManager();

        const fulfillment = new RequestFulfillment({
            purchaseRequest,
            offer,
            order,
            quantity,
        });

        return await manager.save(fulfillment);
    }

    /**
     * Récupère tous les engagements de producteurs qui comblent une demande d'achat.
     */
    async getFulfillmentsByRequest(purchaseRequestId: string): Promise<RequestFulfillment[]> {
        return await this.fulfillmentsRepo.find({
            where: { purchaseRequest: { id: purchaseRequestId } as any, deleted: false },
            relations: ['offer', 'offer.sellerUser', 'order'],
        });
    }
}
