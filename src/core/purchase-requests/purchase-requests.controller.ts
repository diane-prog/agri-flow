import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { QueryPurchaseRequestDto } from './dto/query-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { PurchaseRequestsService } from './purchase-requests.service';

@ApiTags('Purchase Requests')
@Controller('purchase-requests')
export class PurchaseRequestsController {
    constructor(
        private readonly requestsService: PurchaseRequestsService,
    ) {}

    @Public()
    @Get()
    @ApiOperation({ summary: 'Consulter les demandes d’achat (appels d’offres en cours)' })
    @ApiResponse({ status: 200, description: 'Liste paginée des demandes' })
    async findAll(@Query() query: QueryPurchaseRequestDto) {
        return await this.requestsService.findAll(query);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Get('my')
    @ApiOperation({ summary: 'Consulter mes demandes d’achat créées (Acheteur)' })
    @ApiResponse({ status: 200, description: 'Mes demandes d’achat' })
    async getMyRequests(@CurrentUser('id') userId: string) {
        return await this.requestsService.findByBuyer(userId);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Consulter le détail d’une demande d’achat' })
    @ApiResponse({ status: 200, description: 'Détail de la demande' })
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.requestsService.findById(id);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.BUYER, UserRoleEnum.ORGANIZATION_OWNER, UserRoleEnum.ORGANIZATION_MANAGER, UserRoleEnum.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Créer une demande d’achat de produits agricoles (Acheteur / Grossiste)' })
    @ApiResponse({ status: 201, description: 'Demande publiée avec succès' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreatePurchaseRequestDto,
    ): Promise<PurchaseRequest> {
        return await this.requestsService.create(userId, dto);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Modifier une demande d’achat (Créateur)' })
    @ApiResponse({ status: 200, description: 'Demande mise à jour' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdatePurchaseRequestDto,
    ): Promise<PurchaseRequest> {
        return await this.requestsService.update(id, userId, dto);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post(':id/close')
    @ApiOperation({ summary: 'Clôturer une demande d’achat' })
    @ApiResponse({ status: 200, description: 'Demande clôturée' })
    async close(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<PurchaseRequest> {
        return await this.requestsService.close(id, userId);
    }
}
