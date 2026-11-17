import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OrderStatusEnum } from '../../common/enum';
import { OrdersRepository } from '../orders/repositories/orders.repository';
import { OrdersService } from '../orders/orders.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { Dispute } from './entities/dispute.entity';
import { DisputesRepository } from './repositories/disputes.repository';

@Injectable()
export class DisputesService {
    constructor(
        private readonly disputesRepo: DisputesRepository,
        private readonly ordersRepo: OrdersRepository,
        private readonly usersRepo: UsersRepository,
        private readonly ordersService: OrdersService,
    ) {}

    /**
     * Ouvre un litige formel sur une commande en cours ou livrée.
     */
    async create(userId: string, dto: CreateDisputeDto): Promise<Dispute> {
        const order = await this.ordersRepo.findById(dto.orderId, ['buyerUser', 'sellerUser']);
        if (!order) {
            throw new NotFoundException(`Commande ${dto.orderId} introuvable`);
        }

        if (order.buyerUser?.id !== userId && order.sellerUser?.id !== userId) {
            throw new ForbiddenException('Seules les parties engagées peuvent ouvrir un litige');
        }

        const existing = await this.disputesRepo.findOne({
            where: {
                order: { id: dto.orderId } as any,
                status: 'OPEN',
                deleted: false,
            },
        });
        if (existing) {
            throw new BadRequestException('Un litige est déjà ouvert et en cours de traitement pour cette commande');
        }

        const user = await this.usersRepo.findById(userId);

        const dispute = new Dispute({
            order,
            openedBy: user!,
            reason: dto.reason,
            description: dto.description,
            proofUrls: dto.proofUrls ?? [],
            status: 'OPEN',
        });

        const savedDispute = await this.disputesRepo.create(dispute);

        // Bascule de la commande vers l'état DISPUTED avec traçabilité
        await this.ordersService.updateStatus(
            order.id,
            OrderStatusEnum.DISPUTED,
            userId,
            `Litige ouvert : "${dto.reason}". Traitement en cours par l'équipe de médiation.`,
        );

        return savedDispute;
    }

    /**
     * Résout un litige avec arbitrage (Admin / Agent plateforme).
     */
    async resolve(
        disputeId: string,
        adminId: string,
        dto: ResolveDisputeDto,
    ): Promise<Dispute> {
        const dispute = await this.disputesRepo.findById(disputeId, ['order']);
        if (!dispute) throw new NotFoundException('Dossier de litige introuvable');

        const admin = await this.usersRepo.findById(adminId);

        dispute.status = 'RESOLVED';
        dispute.resolution = dto.resolution;
        dispute.resolvedBy = admin!;
        dispute.resolvedAt = new Date();

        await this.disputesRepo.save(dispute);

        await this.ordersService.updateStatus(
            dispute.order.id,
            OrderStatusEnum.COMPLETED,
            adminId,
            `Litige résolu : ${dto.resolution}`,
        );

        return dispute;
    }

    async findAll(status?: string): Promise<Dispute[]> {
        const qb = this.disputesRepo
            .getRepository()
            .createQueryBuilder('dispute')
            .leftJoinAndSelect('dispute.order', 'order')
            .leftJoinAndSelect('dispute.openedBy', 'openedBy')
            .leftJoinAndSelect('dispute.resolvedBy', 'resolvedBy')
            .where('dispute.deleted = false');

        if (status) {
            qb.andWhere('dispute.status = :status', { status });
        }

        return await qb.orderBy('dispute.createdAt', 'DESC').getMany();
    }

    async findByOrder(orderId: string): Promise<Dispute | null> {
        return await this.disputesRepo.findOne({
            where: { order: { id: orderId } as any, deleted: false },
            relations: ['openedBy', 'resolvedBy', 'order'],
        });
    }

    async findMyDisputes(userId: string): Promise<Dispute[]> {
        const qb = this.disputesRepo
            .getRepository()
            .createQueryBuilder('dispute')
            .leftJoinAndSelect('dispute.order', 'order')
            .leftJoinAndSelect('order.buyerUser', 'buyer')
            .leftJoinAndSelect('order.sellerUser', 'seller')
            .leftJoinAndSelect('dispute.openedBy', 'openedBy')
            .leftJoinAndSelect('dispute.resolvedBy', 'resolvedBy')
            .where('dispute.deleted = false')
            .andWhere('(dispute.openedBy.id = :userId OR buyer.id = :userId OR seller.id = :userId)', { userId })
            .orderBy('dispute.createdAt', 'DESC');

        return await qb.getMany();
    }
}
