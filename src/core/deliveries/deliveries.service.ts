import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { DeliveryStatusEnum, OrderStatusEnum } from '../../common/enum';
import { LocationsRepository } from '../locations/repositories/locations.repository';
import { OrdersRepository } from '../orders/repositories/orders.repository';
import { OrdersService } from '../orders/orders.service';
import { UsersRepository } from '../users/repositories/users.repository';
import {
    ConfirmDeliveryDto,
    CreateDeliveryDto,
    DispatchDeliveryDto,
} from './dto/create-delivery.dto';
import { Delivery } from './entities/delivery.entity';
import { DeliveriesRepository } from './repositories/deliveries.repository';

@Injectable()
export class DeliveriesService {
    constructor(
        private readonly deliveriesRepo: DeliveriesRepository,
        private readonly ordersRepo: OrdersRepository,
        private readonly locationsRepo: LocationsRepository,
        private readonly usersRepo: UsersRepository,
        private readonly ordersService: OrdersService,
    ) {}

    /**
     * Crée ou initialise le dossier de livraison pour une commande confirmée.
     */
    async create(userId: string, dto: CreateDeliveryDto): Promise<Delivery> {
        const order = await this.ordersRepo.findById(dto.orderId, ['buyerUser', 'sellerUser']);
        if (!order) {
            throw new NotFoundException(`Commande ${dto.orderId} introuvable`);
        }

        if (order.buyerUser?.id !== userId && order.sellerUser?.id !== userId) {
            throw new ForbiddenException('Seules les parties de la commande peuvent planifier la livraison');
        }

        const existing = await this.deliveriesRepo.findOne({
            where: { order: { id: dto.orderId } as any, deleted: false },
        });
        if (existing) {
            throw new BadRequestException('Un suivi de livraison existe déjà pour cette commande');
        }

        let transporter: any;
        if (dto.transporterUserId) {
            transporter = await this.usersRepo.findById(dto.transporterUserId);
        }

        let pickupLoc: any;
        if (dto.pickupLocationId) {
            pickupLoc = await this.locationsRepo.findById(dto.pickupLocationId);
        }

        let deliveryLoc: any;
        if (dto.deliveryLocationId) {
            deliveryLoc = await this.locationsRepo.findById(dto.deliveryLocationId);
        }

        const delivery = new Delivery({
            order,
            transporterUser: transporter,
            transporterName: dto.transporterName,
            transporterPhone: dto.transporterPhone,
            vehicleInfo: dto.vehicleInfo,
            pickupLocation: pickupLoc,
            deliveryLocation: deliveryLoc,
            expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : undefined,
            status: DeliveryStatusEnum.PENDING,
            notes: dto.notes,
        });

        return await this.deliveriesRepo.create(delivery);
    }

    /**
     * Déclare le départ de la marchandise (expédition).
     */
    async dispatch(
        deliveryId: string,
        userId: string,
        dto: DispatchDeliveryDto,
    ): Promise<Delivery> {
        const delivery = await this.deliveriesRepo.findById(deliveryId, ['order', 'order.sellerUser']);
        if (!delivery) throw new NotFoundException('Dossier de livraison introuvable');

        if (delivery.order.sellerUser?.id !== userId) {
            throw new ForbiddenException('Seul le vendeur peut déclarer le départ de la livraison');
        }

        delivery.quantityDispatched = dto.quantityDispatched;
        delivery.dispatchedAt = dto.dispatchedAt ? new Date(dto.dispatchedAt) : new Date();
        delivery.status = DeliveryStatusEnum.IN_TRANSIT;
        if (dto.proofUrl) delivery.proofUrl = dto.proofUrl;

        await this.deliveriesRepo.save(delivery);

        // Synchroniser le statut de la commande vers DISPATCHED
        await this.ordersService.updateStatus(
            delivery.order.id,
            OrderStatusEnum.DISPATCHED,
            userId,
            `Marchandise expédiée (${dto.quantityDispatched} unités).`,
        );

        return delivery;
    }

    /**
     * Déclare l'arrivée de la livraison à destination.
     */
    async markDelivered(deliveryId: string, userId: string, proofUrl?: string): Promise<Delivery> {
        const delivery = await this.deliveriesRepo.findById(deliveryId, ['order']);
        if (!delivery) throw new NotFoundException('Dossier de livraison introuvable');

        delivery.deliveredAt = new Date();
        delivery.status = DeliveryStatusEnum.DELIVERED;
        if (proofUrl) delivery.proofUrl = proofUrl;

        await this.deliveriesRepo.save(delivery);

        await this.ordersService.updateStatus(
            delivery.order.id,
            OrderStatusEnum.DELIVERED,
            userId,
            'Marchandise livrée sur site.',
        );

        return delivery;
    }

    /**
     * L'acheteur confirme formellement la quantité réceptionnée et clôture la livraison.
     */
    async confirmReceipt(
        deliveryId: string,
        userId: string,
        dto: ConfirmDeliveryDto,
    ): Promise<Delivery> {
        const delivery = await this.deliveriesRepo.findById(deliveryId, ['order', 'order.buyerUser']);
        if (!delivery) throw new NotFoundException('Dossier de livraison introuvable');

        if (delivery.order.buyerUser?.id !== userId) {
            throw new ForbiddenException('Seul l\'acheteur peut confirmer la réception de la marchandise');
        }

        delivery.quantityReceived = dto.quantityReceived;
        delivery.status = DeliveryStatusEnum.ACCEPTED;
        if (dto.proofUrl) delivery.proofUrl = dto.proofUrl;
        if (dto.notes) delivery.notes = dto.notes;

        await this.deliveriesRepo.save(delivery);

        // Clôture automatique de la commande suite à conformité
        await this.ordersService.updateStatus(
            delivery.order.id,
            OrderStatusEnum.COMPLETED,
            userId,
            `Réception confirmée par l'acheteur : ${dto.quantityReceived} unités pesées et acceptées.`,
        );

        return delivery;
    }

    async findByOrder(orderId: string): Promise<Delivery | null> {
        return await this.deliveriesRepo.findOne({
            where: { order: { id: orderId } as any, deleted: false },
            relations: ['transporterUser', 'pickupLocation', 'deliveryLocation', 'order'],
        });
    }

    async findMyDeliveries(userId: string): Promise<Delivery[]> {
        return await this.deliveriesRepo
            .getRepository()
            .createQueryBuilder('delivery')
            .leftJoinAndSelect('delivery.order', 'order')
            .leftJoinAndSelect('order.buyerUser', 'buyer')
            .leftJoinAndSelect('order.sellerUser', 'seller')
            .leftJoinAndSelect('delivery.transporterUser', 'transporter')
            .leftJoinAndSelect('delivery.pickupLocation', 'pickup')
            .leftJoinAndSelect('delivery.deliveryLocation', 'deliveryLoc')
            .where('delivery.deleted = false')
            .andWhere('(buyer.id = :userId OR seller.id = :userId OR transporter.id = :userId)', { userId })
            .orderBy('delivery.createdAt', 'DESC')
            .getMany();
    }
}
