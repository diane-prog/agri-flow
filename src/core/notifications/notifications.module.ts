import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { UsersModule } from '../users/users.module';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Notification]),
        UsersModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsRepository, NotificationsService],
    exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
