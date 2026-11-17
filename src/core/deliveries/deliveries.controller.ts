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
import {
    ConfirmDeliveryDto,
    CreateDeliveryDto,
    DispatchDeliveryDto,
} from './dto/create-delivery.dto';
import { Delivery } from './entities/delivery.entity';
import { DeliveriesService } from './deliveries.service';

@ApiTags('Deliveries & Transport')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('deliveries')
export class DeliveriesController {
    constructor(private readonly deliveriesService: DeliveriesService) {}

    @Get()
    @ApiOperation({ summary: 'Lister les livraisons concernant l’utilisateur connecté (vendeur, acheteur ou transporteur)' })
    @ApiResponse({ status: 200, description: 'Liste des livraisons' })
    async getMyDeliveries(@CurrentUser('id') userId: string): Promise<Delivery[]> {
        return await this.deliveriesService.findMyDeliveries(userId);
    }

    @Get('by-order/:orderId')
    @ApiOperation({ summary: 'Obtenir les informations de livraison d’une commande' })
    @ApiResponse({ status: 200, description: 'Détail de la livraison' })
    async findByOrder(@Param('orderId') orderId: string): Promise<Delivery | null> {
        return await this.deliveriesService.findByOrder(orderId);
    }

    @Post()
    @ApiOperation({ summary: 'Initialiser le suivi logistique pour une commande' })
    @ApiResponse({ status: 201, description: 'Livraison initialisée' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateDeliveryDto,
    ): Promise<Delivery> {
        return await this.deliveriesService.create(userId, dto);
    }

    @Post(':id/dispatch')
    @ApiOperation({ summary: 'Déclarer le départ et la quantité expédiée (Vendeur)' })
    @ApiResponse({ status: 200, description: 'Expédition enregistrée' })
    async dispatch(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: DispatchDeliveryDto,
    ): Promise<Delivery> {
        return await this.deliveriesService.dispatch(id, userId, dto);
    }

    @Post(':id/deliver')
    @ApiOperation({ summary: 'Déclarer l’arrivée sur site (Transporteur / Vendeur)' })
    @ApiResponse({ status: 200, description: 'Livraison enregistrée' })
    async markDelivered(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body('proofUrl') proofUrl?: string,
    ): Promise<Delivery> {
        return await this.deliveriesService.markDelivered(id, userId, proofUrl);
    }

    @Post(':id/confirm-receipt')
    @ApiOperation({ summary: 'Confirmer la quantité réceptionnée et clôturer la commande (Acheteur)' })
    @ApiResponse({ status: 200, description: 'Réception confirmée et commande terminée' })
    async confirmReceipt(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: ConfirmDeliveryDto,
    ): Promise<Delivery> {
        return await this.deliveriesService.confirmReceipt(id, userId, dto);
    }
}
