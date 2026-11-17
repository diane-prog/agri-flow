import {
    Body,
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
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { Dispute } from './entities/dispute.entity';
import { DisputesService } from './disputes.service';

@ApiTags('Disputes & Claims')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
    constructor(private readonly disputesService: DisputesService) {}

    @Get('by-order/:orderId')
    @ApiOperation({ summary: 'Consulter l’état du litige pour une commande' })
    @ApiResponse({ status: 200, description: 'Détail du litige' })
    async findByOrder(@Param('orderId') orderId: string): Promise<Dispute | null> {
        return await this.disputesService.findByOrder(orderId);
    }

    @Post()
    @ApiOperation({ summary: 'Ouvrir une contestation ou un litige sur une commande' })
    @ApiResponse({ status: 201, description: 'Litige ouvert' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateDisputeDto,
    ): Promise<Dispute> {
        return await this.disputesService.create(userId, dto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Consulter mes litiges (Acheteur / Vendeur)' })
    @ApiResponse({ status: 200, description: 'Mes litiges' })
    async getMyDisputes(@CurrentUser('id') userId: string): Promise<Dispute[]> {
        return await this.disputesService.findMyDisputes(userId);
    }

    @Get()
    @ApiOperation({ summary: 'Lister les dossiers de litiges (Admin voit tout, utilisateur voit les siens)' })
    @ApiResponse({ status: 200, description: 'Liste des litiges' })
    async findAll(
        @CurrentUser() user: any,
        @Query('status') status?: string,
    ): Promise<Dispute[]> {
        const roles = user?.roles || [];
        const isAdmin = roles.some((r: any) => {
            const roleName = typeof r === 'string' ? r : r.role;
            return [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.PLATFORM_AGENT].includes(roleName);
        });

        if (isAdmin) {
            return await this.disputesService.findAll(status);
        }
        return await this.disputesService.findMyDisputes(user.id);
    }

    @UseGuards(RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.PLATFORM_AGENT)
    @Post(':id/resolve')
    @ApiOperation({ summary: 'Arbitrer et clore un litige avec décision motivée (Admin / Médiateur)' })
    @ApiResponse({ status: 200, description: 'Litige résolu' })
    async resolve(
        @Param('id') id: string,
        @CurrentUser('id') adminId: string,
        @Body() dto: ResolveDisputeDto,
    ): Promise<Dispute> {
        return await this.disputesService.resolve(id, adminId, dto);
    }
}
