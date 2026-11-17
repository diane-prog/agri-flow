import {
    Body,
    Controller,
    Delete,
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
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Listing } from './entities/listing.entity';
import { ListingsService } from './listings.service';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
    constructor(private readonly listingsService: ListingsService) {}

    @Public()
    @Get()
    @ApiOperation({ summary: 'Rechercher et filtrer les annonces agricoles disponibles' })
    @ApiResponse({ status: 200, description: 'Liste paginée des annonces' })
    async findAll(@Query() query: QueryListingDto) {
        return await this.listingsService.findAll(query);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Consulter le détail d’une annonce' })
    @ApiResponse({ status: 200, description: 'Détail de l\'annonce' })
    async findById(@Param('id') id: string) {
        return await this.listingsService.findById(id);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.PRODUCER, UserRoleEnum.ORGANIZATION_OWNER, UserRoleEnum.ORGANIZATION_MANAGER, UserRoleEnum.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Publier une annonce agricole (Producteur / Coopérative)' })
    @ApiResponse({ status: 201, description: 'Annonce créée et publiée' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateListingDto,
    ): Promise<Listing> {
        return await this.listingsService.create(userId, dto);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Modifier une annonce existante (Propriétaire)' })
    @ApiResponse({ status: 200, description: 'Annonce mise à jour' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateListingDto,
    ): Promise<Listing> {
        return await this.listingsService.update(id, userId, dto);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post(':id/pause')
    @ApiOperation({ summary: 'Mettre en pause une annonce' })
    @ApiResponse({ status: 200, description: 'Annonce mise en pause' })
    async pause(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Listing> {
        return await this.listingsService.pause(id, userId);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post(':id/publish')
    @ApiOperation({ summary: 'Réactiver / publier une annonce' })
    @ApiResponse({ status: 200, description: 'Annonce publiée' })
    async publish(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Listing> {
        return await this.listingsService.publish(id, userId);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer / archiver une annonce' })
    @ApiResponse({ status: 200, description: 'Annonce supprimée' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        return await this.listingsService.delete(id, userId);
    }
}
