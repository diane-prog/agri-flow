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
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequireKyc } from '../../common/decorators/require-kyc.decorator';
import { HarvestForecastStatusEnum, VerificationLevelEnum } from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { KycGuard } from '../../common/guards/kyc.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { CreateHarvestForecastDto } from './dto/create-harvest-forecast.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { UpdateHarvestForecastDto } from './dto/update-harvest-forecast.dto';
import { Farm } from './entities/farm.entity';
import { HarvestForecast } from './entities/harvest-forecast.entity';
import { FarmsService } from './services/farms.service';

@ApiTags('Exploitations Agricoles & Récoltes Futures')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('farms')
export class FarmsController {
    constructor(private readonly farmsService: FarmsService) {}

    @Post()
    @UseGuards(KycGuard)
    @RequireKyc(VerificationLevelEnum.LEVEL_1)
    @ApiOperation({ summary: 'Enregistrer une exploitation agricole (Producteur individuel ou Coopérative)' })
    @ApiResponse({ status: 201, description: 'Exploitation enregistrée' })
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateFarmDto,
    ): Promise<Farm> {
        return await this.farmsService.createFarm(user, dto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Lister mes exploitations agricoles' })
    async findMyFarms(@CurrentUser() user: User): Promise<Farm[]> {
        return await this.farmsService.findFarmsByUser(user.id);
    }

    @Get('by-organization/:orgId')
    @ApiOperation({ summary: 'Lister les exploitations d’une organisation / coopérative' })
    async findByOrganization(@Param('orgId', ParseUUIDPipe) orgId: string): Promise<Farm[]> {
        return await this.farmsService.findFarmsByOrganization(orgId);
    }

    @Public()
    @Get('harvest-forecasts')
    @ApiOperation({ summary: 'Explorer les récoltes futures prévisionnelles (Planification des approvisionnements)' })
    @ApiQuery({ name: 'productId', required: false })
    @ApiQuery({ name: 'status', enum: HarvestForecastStatusEnum, required: false })
    @ApiQuery({ name: 'farmId', required: false })
    async findHarvestForecasts(
        @Query('productId') productId?: string,
        @Query('status') status?: HarvestForecastStatusEnum,
        @Query('farmId') farmId?: string,
    ): Promise<HarvestForecast[]> {
        return await this.farmsService.findHarvestForecasts({ productId, status, farmId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d’une exploitation avec l’historique de ses récoltes prévisionnelles' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Farm> {
        return await this.farmsService.getFarmById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Modifier les informations d’une exploitation' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
        @Body() dto: UpdateFarmDto,
    ): Promise<Farm> {
        return await this.farmsService.updateFarm(id, user, dto);
    }

    @Post('harvest-forecasts')
    @ApiOperation({ summary: 'Déclarer une récolte future prévisionnelle' })
    async addForecast(
        @CurrentUser() user: User,
        @Body() dto: CreateHarvestForecastDto,
    ): Promise<HarvestForecast> {
        return await this.farmsService.addHarvestForecast(user, dto);
    }

    @Patch('harvest-forecasts/:id')
    @ApiOperation({ summary: 'Mettre à jour le statut ou le volume d’une récolte prévisionnelle' })
    async updateForecast(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
        @Body() dto: UpdateHarvestForecastDto,
    ): Promise<HarvestForecast> {
        return await this.farmsService.updateHarvestForecast(id, user, dto);
    }
}
