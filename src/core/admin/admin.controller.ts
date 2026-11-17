import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
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
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModerateListingDto, VerifyUserDto } from './dto/verify-user.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin & Supervision')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('dashboard')
    @ApiOperation({ summary: 'Tableau de bord et indicateurs clés de performance (KPIs)' })
    @ApiResponse({ status: 200, description: 'Statistiques de la plateforme' })
    async getDashboard() {
        return await this.adminService.getDashboardStats();
    }

    @Get('audit-logs')
    @ApiOperation({ summary: 'Consulter le journal d’audit des actions sensibles' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Journal d\'audit' })
    async getAuditLogs(@Query('limit') limit?: number) {
        return await this.adminService.getAuditLogs(limit ? Number(limit) : 50);
    }

    @Post('users/:id/verify')
    @ApiOperation({ summary: 'Valider le niveau KYC d’un utilisateur (Niveau 1 ou 2)' })
    @ApiResponse({ status: 200, description: 'Niveau mis à jour' })
    async verifyUser(
        @Param('id') userId: string,
        @CurrentUser('id') adminId: string,
        @Body() dto: VerifyUserDto,
    ) {
        return await this.adminService.verifyUser(userId, adminId, dto);
    }

    @Patch('users/:id/suspend')
    @ApiOperation({ summary: 'Suspendre un compte utilisateur' })
    @ApiResponse({ status: 200, description: 'Compte suspendu' })
    async suspendUser(
        @Param('id') userId: string,
        @CurrentUser('id') adminId: string,
        @Body('reason') reason: string,
    ) {
        return await this.adminService.suspendUser(userId, adminId, reason ?? 'Non spécifié');
    }

    @Patch('users/:id/activate')
    @ApiOperation({ summary: 'Réactiver un compte suspendu' })
    @ApiResponse({ status: 200, description: 'Compte réactivé' })
    async activateUser(
        @Param('id') userId: string,
        @CurrentUser('id') adminId: string,
    ) {
        return await this.adminService.activateUser(userId, adminId);
    }

    @Post('listings/:id/moderate')
    @ApiOperation({ summary: 'Modérer une annonce (Validation / Rejet / Suspension)' })
    @ApiResponse({ status: 200, description: 'Annonce modérée' })
    async moderateListing(
        @Param('id') listingId: string,
        @CurrentUser('id') adminId: string,
        @Body() dto: ModerateListingDto,
    ) {
        return await this.adminService.moderateListing(listingId, adminId, dto);
    }
}
