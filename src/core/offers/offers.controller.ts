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
import { CounterOfferDto } from './dto/counter-offer.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';

@ApiTags('Offers & Negotiations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) {}

    @Get()
    @ApiOperation({ summary: 'Lister les offres et négociations de l’utilisateur (émises ou reçues)' })
    @ApiResponse({ status: 200, description: 'Liste des offres' })
    async getMyOffers(@CurrentUser('id') userId: string): Promise<Offer[]> {
        return await this.offersService.findByUser(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consulter le détail d’une offre avec l’historique complet des contre-propositions' })
    @ApiResponse({ status: 200, description: 'Détail de l\'offre' })
    async getOfferById(@Param('id') id: string): Promise<Offer> {
        return await this.offersService.findById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Émettre une offre en réponse à une annonce ou à une demande d\'achat' })
    @ApiResponse({ status: 201, description: 'Offre créée' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateOfferDto,
    ): Promise<Offer> {
        return await this.offersService.create(userId, dto);
    }

    @Post(':id/counter')
    @ApiOperation({ summary: 'Faire une contre-proposition de prix ou de quantité (historisée)' })
    @ApiResponse({ status: 200, description: 'Contre-offre enregistrée' })
    async counter(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CounterOfferDto,
    ): Promise<Offer> {
        return await this.offersService.counter(id, userId, dto);
    }

    @Post(':id/accept')
    @ApiOperation({ summary: 'Accepter une offre (Génère la commande et réserve le stock)' })
    @ApiResponse({ status: 200, description: 'Offre acceptée et commande générée' })
    async accept(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return await this.offersService.accept(id, userId);
    }

    @Post(':id/reject')
    @ApiOperation({ summary: 'Refuser une proposition' })
    @ApiResponse({ status: 200, description: 'Offre refusée' })
    async reject(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Offer> {
        return await this.offersService.reject(id, userId);
    }

    @Post(':id/withdraw')
    @ApiOperation({ summary: 'Retirer son offre' })
    @ApiResponse({ status: 200, description: 'Offre retirée' })
    async withdraw(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Offer> {
        return await this.offersService.withdraw(id, userId);
    }
}
