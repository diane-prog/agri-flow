import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatusEnum, OrderStatusEnum } from '../../common/enum';
import { ListingsRepository } from '../listings/repositories/listings.repository';
import { OrdersRepository } from '../orders/repositories/orders.repository';
import { PurchaseRequestsRepository } from '../purchase-requests/repositories/purchase-requests.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { ModerateListingDto, VerifyUserDto } from './dto/verify-user.dto';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogsRepository } from './repositories/audit-logs.repository';

@Injectable()
export class AdminService {
    constructor(
        private readonly auditLogsRepo: AuditLogsRepository,
        private readonly usersRepo: UsersRepository,
        private readonly listingsRepo: ListingsRepository,
        private readonly ordersRepo: OrdersRepository,
        private readonly requestsRepo: PurchaseRequestsRepository,
    ) {}

    /**
     * Enregistre une entrée immuable dans le journal d'audit.
     */
    async logAction(
        actorId: string,
        action: string,
        entityType: string,
        entityId?: string,
        metadata: Record<string, any> = {},
    ): Promise<AuditLog> {
        const actor = await this.usersRepo.findById(actorId);

        const log = new AuditLog({
            actorUser: actor ?? undefined,
            action,
            entityType,
            entityId,
            metadata,
        });

        return await this.auditLogsRepo.create(log);
    }

    /**
     * Tableau de bord opérationnel & KPIs commerciaux AgriFlow (PRD Section 16).
     */
    async getDashboardStats() {
        const totalUsers = await this.usersRepo.count({ where: { deleted: false } });
        const activeListings = await this.listingsRepo.count({
            where: { status: ListingStatusEnum.ACTIVE, deleted: false },
        });
        const openRequests = await this.requestsRepo.count({
            where: { deleted: false },
        });

        const completedOrders = await this.ordersRepo.find({
            where: { status: OrderStatusEnum.COMPLETED, deleted: false },
        });

        const totalOrders = await this.ordersRepo.count({ where: { deleted: false } });

        const totalVolumeXof = completedOrders.reduce(
            (sum, order) => sum + Number(order.subtotal),
            0,
        );

        const conversionRate =
            totalOrders > 0
                ? Number(((completedOrders.length / totalOrders) * 100).toFixed(1))
                : 0;

        return {
            users: {
                total: totalUsers,
            },
            marketplace: {
                activeListings,
                openRequests,
                totalOrders,
                completedOrders: completedOrders.length,
                conversionRatePercent: conversionRate,
                totalCommercialVolumeXof: totalVolumeXof,
            },
        };
    }

    /**
     * Liste les logs d'audit administratifs.
     */
    async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
        return await this.auditLogsRepo.find({
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['actorUser'],
        });
    }

    /**
     * Met à jour le niveau de vérification progressive d'un acteur (KYC 0 -> 1 -> 2).
     */
    async verifyUser(
        userId: string,
        adminId: string,
        dto: VerifyUserDto,
    ) {
        const user = await this.usersRepo.findById(userId);
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        const previousLevel = user.verificationLevel;
        user.verificationLevel = dto.verificationLevel;
        const updated = await this.usersRepo.save(user);

        await this.logAction(adminId, 'USER_KYC_VERIFIED', 'USER', userId, {
            previousLevel,
            newLevel: dto.verificationLevel,
            notes: dto.notes,
        });

        return updated;
    }

    /**
     * Suspend un compte utilisateur.
     */
    async suspendUser(userId: string, adminId: string, reason: string) {
        const user = await this.usersRepo.findById(userId);
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        user.status = 'SUSPENDED';
        const updated = await this.usersRepo.save(user);

        await this.logAction(adminId, 'USER_SUSPENDED', 'USER', userId, { reason });
        return updated;
    }

    /**
     * Réactive un compte suspendu.
     */
    async activateUser(userId: string, adminId: string) {
        const user = await this.usersRepo.findById(userId);
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        user.status = 'ACTIVE';
        const updated = await this.usersRepo.save(user);

        await this.logAction(adminId, 'USER_ACTIVATED', 'USER', userId);
        return updated;
    }

    /**
     * Modère une annonce agricole.
     */
    async moderateListing(
        listingId: string,
        adminId: string,
        dto: ModerateListingDto,
    ) {
        const listing = await this.listingsRepo.findById(listingId);
        if (!listing) throw new NotFoundException('Annonce introuvable');

        const previousStatus = listing.status;
        listing.status = dto.status;
        const updated = await this.listingsRepo.save(listing);

        await this.logAction(adminId, 'LISTING_MODERATED', 'LISTING', listingId, {
            previousStatus,
            newStatus: dto.status,
            reason: dto.reason,
        });

        return updated;
    }
}
