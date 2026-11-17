import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OrderStatusEnum } from '../../common/enum';
import { Offer } from '../offers/entities/offer.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Order } from './entities/order.entity';
import { OrderStatusHistoryRepository } from './repositories/order-status-history.repository';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepo: OrdersRepository,
        private readonly historyRepo: OrderStatusHistoryRepository,
        private readonly usersRepo: UsersRepository,
    ) {}

    /**
     * Génère une commande ferme suite à l'acceptation d'une offre commerciale.
     */
    async createFromOffer(offer: Offer, customManager?: EntityManager): Promise<Order> {
        const manager = customManager ?? this.ordersRepo.getManager();

        const reference = this.generateOrderReference();
        const subtotal = Number(offer.quantity) * Number(offer.unitPrice);

        const order = new Order({
            reference,
            offer,
            buyerUser: offer.buyerUser,
            sellerUser: offer.sellerUser,
            sellerOrganizationId: offer.sellerOrganizationId,
            transactionMode: offer.transactionMode,
            subtotal,
            currency: offer.currency,
            status: OrderStatusEnum.PENDING_CONFIRMATION,
        });

        const savedOrder = await manager.save(order);

        // Historisation de l'état initial
        const history = new OrderStatusHistory({
            order: savedOrder,
            newStatus: OrderStatusEnum.PENDING_CONFIRMATION,
            actorUser: offer.buyerUser,
            reason: 'Création de la commande suite à accord sur l\'offre commerciale.',
        });
        await manager.save(history);

        return savedOrder;
    }

    /**
     * Fait transiter la commande vers un nouvel état avec historisation obligatoire.
     */
    async updateStatus(
        orderId: string,
        newStatus: OrderStatusEnum,
        actorId: string,
        reason?: string,
        customManager?: EntityManager,
    ): Promise<Order> {
        const manager = customManager ?? this.ordersRepo.getManager();

        const order = await this.ordersRepo.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Commande ${orderId} introuvable`);
        }

        const actor = await this.usersRepo.findById(actorId);
        const previousStatus = order.status;

        order.status = newStatus;
        if (newStatus === OrderStatusEnum.CONFIRMED && !order.confirmedAt) {
            order.confirmedAt = new Date();
        } else if (newStatus === OrderStatusEnum.COMPLETED && !order.completedAt) {
            order.completedAt = new Date();
        }

        const updatedOrder = await manager.save(order);

        const history = new OrderStatusHistory({
            order: updatedOrder,
            previousStatus,
            newStatus,
            actorUser: actor ?? undefined,
            reason: reason ?? `Changement d'état vers ${newStatus}`,
        });
        await manager.save(history);

        return updatedOrder;
    }

    async confirm(orderId: string, userId: string): Promise<Order> {
        const order = await this.getOrderWithAuth(orderId, userId);
        if (order.status !== OrderStatusEnum.PENDING_CONFIRMATION) {
            throw new BadRequestException('Seule une commande en attente peut être confirmée');
        }
        return await this.updateStatus(orderId, OrderStatusEnum.CONFIRMED, userId, 'Commande confirmée par le vendeur');
    }

    async prepare(orderId: string, userId: string): Promise<Order> {
        const order = await this.getOrderWithAuth(orderId, userId);
        return await this.updateStatus(orderId, OrderStatusEnum.PREPARING, userId, 'Préparation de la marchandise en cours');
    }

    async readyForPickup(orderId: string, userId: string): Promise<Order> {
        const order = await this.getOrderWithAuth(orderId, userId);
        return await this.updateStatus(orderId, OrderStatusEnum.READY_FOR_PICKUP, userId, 'Marchandise prête pour le ramassage');
    }

    async dispatch(orderId: string, userId: string): Promise<Order> {
        const order = await this.getOrderWithAuth(orderId, userId);
        return await this.updateStatus(orderId, OrderStatusEnum.DISPATCHED, userId, 'Marchandise expédiée / prise en charge transporteur');
    }

    async deliver(orderId: string, userId: string): Promise<Order> {
        const order = await this.getOrderWithAuth(orderId, userId);
        return await this.updateStatus(orderId, OrderStatusEnum.DELIVERED, userId, 'Marchandise livrée à destination');
    }

    async complete(orderId: string, userId: string): Promise<Order> {
        const order = await this.getOrderWithAuth(orderId, userId);
        // Confirmation formelle par l'acheteur
        if (order.buyerUser?.id !== userId) {
            throw new ForbiddenException('Seul l\'acheteur peut valider la réception et clôturer la commande');
        }
        return await this.updateStatus(orderId, OrderStatusEnum.COMPLETED, userId, 'Réception confirmée conforme par l\'acheteur');
    }

    async cancel(orderId: string, userId: string, reason: string): Promise<Order> {
        const order = await this.getOrderWithAuth(orderId, userId);
        if (order.status === OrderStatusEnum.COMPLETED || order.status === OrderStatusEnum.DISPATCHED) {
            throw new BadRequestException('Impossible d\'annuler une commande déjà expédiée ou clôturée');
        }
        return await this.updateStatus(orderId, OrderStatusEnum.CANCELLED, userId, reason);
    }

    async findById(orderId: string, userId?: string): Promise<any> {
        const order = await this.ordersRepo.findOne({
            where: { id: orderId, deleted: false },
            relations: [
                'offer',
                'offer.unit',
                'offer.listing',
                'offer.purchaseRequest',
                'buyerUser',
                'sellerUser',
            ],
        });

        if (!order) {
            throw new NotFoundException(`Commande ${orderId} introuvable`);
        }

        const history = await this.historyRepo.find({
            where: { order: { id: orderId } as any },
            order: { createdAt: 'ASC' },
            relations: ['actorUser'],
        });

        return {
            ...order,
            history,
        };
    }

    async findByUser(userId: string) {
        return await this.ordersRepo.find({
            where: [
                { buyerUser: { id: userId } as any, deleted: false },
                { sellerUser: { id: userId } as any, deleted: false },
            ],
            relations: ['offer', 'offer.unit', 'buyerUser', 'sellerUser'],
            order: { createdAt: 'DESC' },
        });
    }

    private async getOrderWithAuth(orderId: string, userId: string): Promise<Order> {
        const order = await this.ordersRepo.findById(orderId, ['buyerUser', 'sellerUser']);
        if (!order) throw new NotFoundException(`Commande ${orderId} introuvable`);

        if (order.buyerUser?.id !== userId && order.sellerUser?.id !== userId) {
            throw new ForbiddenException('Accès refusé : vous ne participez pas à cette transaction');
        }
        return order;
    }

    private generateOrderReference(): string {
        const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
        const randomPart = Math.floor(10000 + Math.random() * 90000).toString();
        return `AGR-${dateStr}-${randomPart}`;
    }
}
