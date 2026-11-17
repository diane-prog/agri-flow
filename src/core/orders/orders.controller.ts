import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    @ApiOperation({ summary: 'Lister les commandes de l’utilisateur connecté (achats et ventes)' })
    @ApiResponse({ status: 200, description: 'Liste des commandes' })
    async getMyOrders(@CurrentUser('id') userId: string) {
        return await this.ordersService.findByUser(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consulter le détail d’une commande et son historique d’états' })
    @ApiResponse({ status: 200, description: 'Détail de la commande' })
    async getOrderById(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return await this.ordersService.findById(id, userId);
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'Confirmer la commande (Vendeur)' })
    @ApiResponse({ status: 200, description: 'Commande confirmée' })
    async confirm(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Order> {
        return await this.ordersService.confirm(id, userId);
    }

    @Post(':id/prepare')
    @ApiOperation({ summary: 'Passer en préparation de marchandise' })
    async prepare(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Order> {
        return await this.ordersService.prepare(id, userId);
    }

    @Post(':id/ready-for-pickup')
    @ApiOperation({ summary: 'Déclarer la marchandise prête pour l\'enlèvement' })
    async readyForPickup(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Order> {
        return await this.ordersService.readyForPickup(id, userId);
    }

    @Post(':id/dispatch')
    @ApiOperation({ summary: 'Déclarer la marchandise expédiée' })
    async dispatch(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Order> {
        return await this.ordersService.dispatch(id, userId);
    }

    @Post(':id/deliver')
    @ApiOperation({ summary: 'Déclarer la marchandise livrée sur site' })
    async deliver(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Order> {
        return await this.ordersService.deliver(id, userId);
    }

    @Post(':id/complete')
    @ApiOperation({ summary: 'Confirmer la réception conforme et clôturer la transaction (Acheteur)' })
    async complete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Order> {
        return await this.ordersService.complete(id, userId);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Annuler une commande non expédiée avec motif' })
    async cancel(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body('reason') reason: string,
    ): Promise<Order> {
        return await this.ordersService.cancel(id, userId, reason ?? 'Annulation demandée');
    }
}
