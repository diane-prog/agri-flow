import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './repositories/notifications.repository';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly notificationsRepo: NotificationsRepository,
        private readonly usersRepo: UsersRepository,
    ) {}

    /**
     * Envoie une notification interne (In-App) et simule le dispatch push / SMS.
     */
    async send(
        userId: string,
        title: string,
        message: string,
        type: string = 'INFO',
        metadata: Record<string, any> = {},
    ): Promise<Notification> {
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            this.logger.warn(`Impossible d'envoyer une notification à l'utilisateur inexistant ${userId}`);
            throw new NotFoundException('Utilisateur introuvable');
        }

        const notification = new Notification({
            user,
            title,
            message,
            type,
            metadata,
            isRead: false,
        });

        const saved = await this.notificationsRepo.create(notification);

        this.logger.log(
            `🔔 [Notification ${type}] envoyée à ${user.phone} (${user.firstName} ${user.lastName}) : "${title}"`,
        );

        return saved;
    }

    /**
     * Liste les notifications de l'utilisateur.
     */
    async getMyNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
        const qb = this.notificationsRepo
            .getRepository()
            .createQueryBuilder('notif')
            .where('notif.deleted = false')
            .andWhere('notif.userId = :userId', { userId });

        if (unreadOnly) {
            qb.andWhere('notif.isRead = false');
        }

        return await qb.orderBy('notif.createdAt', 'DESC').take(50).getMany();
    }

    /**
     * Marque une notification comme lue.
     */
    async markAsRead(notificationId: string, userId: string): Promise<Notification> {
        const notif = await this.notificationsRepo.findOne({
            where: { id: notificationId, user: { id: userId } as any, deleted: false },
        });

        if (!notif) throw new NotFoundException('Notification introuvable');

        notif.isRead = true;
        return await this.notificationsRepo.save(notif);
    }

    /**
     * Marque toutes les notifications comme lues.
     */
    async markAllAsRead(userId: string): Promise<{ message: string }> {
        await this.notificationsRepo
            .getRepository()
            .createQueryBuilder()
            .update(Notification)
            .set({ isRead: true })
            .where('userId = :userId AND isRead = false', { userId })
            .execute();

        return { message: 'Toutes les notifications ont été marquées comme lues' };
    }
}
