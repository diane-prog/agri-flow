import {
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Obtenir la liste des notifications de l’utilisateur' })
    @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Liste des notifications' })
    async getMyNotifications(
        @CurrentUser('id') userId: string,
        @Query('unreadOnly') unreadOnly?: boolean,
    ): Promise<Notification[]> {
        return await this.notificationsService.getMyNotifications(userId, unreadOnly);
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Marquer une notification comme lue' })
    @ApiResponse({ status: 200, description: 'Notification lue' })
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Notification> {
        return await this.notificationsService.markAsRead(id, userId);
    }

    @Post('read-all')
    @ApiOperation({ summary: 'Marquer toutes ses notifications comme lues' })
    @ApiResponse({ status: 200, description: 'Toutes les notifications marquées comme lues' })
    async markAllAsRead(
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        return await this.notificationsService.markAllAsRead(userId);
    }
}
