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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRoleEnum } from '../../common/enum';
import { AddRoleDto } from './dto/add-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lister tous les utilisateurs de la plateforme (sans filtre)' })
    @ApiResponse({ status: 200, description: 'Liste de tous les utilisateurs' })
    async findAll(): Promise<User[]> {
        return await this.usersService.findAll();
    }

    @Get('me')
    @ApiOperation({ summary: 'Consulter son profil utilisateur et ses rôles' })
    @ApiResponse({ status: 200, description: 'Profil récupéré avec succès' })
    async getProfile(@CurrentUser('id') userId: string): Promise<User> {
        return await this.usersService.findById(userId);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Mettre à jour son profil utilisateur' })
    @ApiResponse({ status: 200, description: 'Profil mis à jour' })
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateProfileDto,
    ): Promise<User> {
        return await this.usersService.updateProfile(userId, dto);
    }

    @Get('me/roles')
    @ApiOperation({ summary: 'Lister les rôles actifs de l’utilisateur' })
    @ApiResponse({ status: 200, description: 'Liste des rôles' })
    async getMyRoles(@CurrentUser('id') userId: string): Promise<UserRoleEnum[]> {
        return await this.usersService.getUserRoles(userId);
    }

    @Post('me/roles')
    @ApiOperation({
        summary: 'Ajouter un rôle métier à son profil (ex: PRODUCER ou BUYER)',
    })
    @ApiResponse({ status: 201, description: 'Rôle ajouté avec succès' })
    async addRole(
        @CurrentUser('id') userId: string,
        @Body() dto: AddRoleDto,
    ): Promise<User> {
        return await this.usersService.addRole(userId, dto.role);
    }

    @Delete('me/roles/:role')
    @ApiOperation({ summary: 'Désactiver un rôle métier de son profil' })
    @ApiResponse({ status: 200, description: 'Rôle retiré avec succès' })
    async removeRole(
        @CurrentUser('id') userId: string,
        @Param('role') role: UserRoleEnum,
    ): Promise<User> {
        return await this.usersService.removeRole(userId, role);
    }

    @Delete('me')
    @ApiOperation({ summary: 'Supprimer / Désactiver son propre compte (Soft Delete)' })
    @ApiResponse({ status: 200, description: 'Compte supprimé et désactivé avec succès' })
    async deleteMe(@CurrentUser('id') userId: string): Promise<{ message: string }> {
        return await this.usersService.deleteMe(userId);
    }

    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un utilisateur de la plateforme (Admin)' })
    @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
    async deleteUserByAdmin(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser('id') adminUserId: string,
    ): Promise<{ message: string }> {
        return await this.usersService.deleteUserByAdmin(id, adminUserId);
    }
}
