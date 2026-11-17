import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
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
import { RequireKyc } from '../../common/decorators/require-kyc.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
    OrganizationVerificationStatusEnum,
    UserRoleEnum,
    VerificationLevelEnum,
} from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { KycGuard } from '../../common/guards/kyc.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationInvitation } from './entities/organization-invitation.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './services/organizations.service';

@ApiTags('Organisations (Coopératives & Entreprises)')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {}

    @Post()
    @UseGuards(KycGuard)
    @RequireKyc(VerificationLevelEnum.LEVEL_1)
    @ApiOperation({ summary: 'Créer une organisation (Coopérative, Entreprise, etc.)' })
    @ApiResponse({ status: 201, description: 'Organisation créée avec succès' })
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateOrganizationDto,
    ): Promise<Organization> {
        return await this.organizationsService.createOrganization(user, dto);
    }

    @Get('my')
    @ApiOperation({ summary: "Lister les organisations dont l'utilisateur connecté est membre" })
    async findMyOrganizations(@CurrentUser() user: User): Promise<Organization[]> {
        return await this.organizationsService.findUserOrganizations(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: "Détails d'une organisation" })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Organization> {
        return await this.organizationsService.findById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: "Modifier les informations d'une organisation (Propriétaire ou Admin)" })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
        @Body() dto: UpdateOrganizationDto,
    ): Promise<Organization> {
        return await this.organizationsService.updateOrganization(id, user, dto);
    }

    @Post(':id/invitations')
    @ApiOperation({ summary: 'Inviter un membre à rejoindre l’organisation' })
    async invite(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
        @Body() dto: InviteMemberDto,
    ): Promise<OrganizationInvitation> {
        return await this.organizationsService.inviteMember(id, user, dto);
    }

    @Post('invitations/accept')
    @ApiOperation({ summary: 'Accepter une invitation avec le code token' })
    async acceptInvitation(
        @CurrentUser() user: User,
        @Body('token') token: string,
    ): Promise<OrganizationMember> {
        return await this.organizationsService.acceptInvitation(token, user);
    }

    @Get(':id/members')
    @ApiOperation({ summary: 'Lister les membres actifs d’une organisation' })
    async getMembers(@Param('id', ParseUUIDPipe) id: string): Promise<OrganizationMember[]> {
        return await this.organizationsService.getOrganizationMembers(id);
    }

    @Delete(':id/members/:memberId')
    @ApiOperation({ summary: 'Retirer un membre de l’organisation' })
    async removeMember(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('memberId', ParseUUIDPipe) memberId: string,
        @CurrentUser() user: User,
    ): Promise<{ message: string }> {
        await this.organizationsService.removeMember(id, memberId, user);
        return { message: 'Membre retiré avec succès' };
    }

    @Patch(':id/verify')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @ApiOperation({ summary: 'Valider ou rejeter la vérification d’une organisation (Admin)' })
    async verify(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() adminUser: User,
        @Body('status') status: OrganizationVerificationStatusEnum,
    ): Promise<Organization> {
        return await this.organizationsService.verifyOrganization(id, status, adminUser);
    }
}
