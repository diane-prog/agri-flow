import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './entities/location.entity';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @Public()
    @Get('regions')
    @ApiOperation({ summary: 'Lister les grandes régions du Bénin' })
    @ApiResponse({ status: 200, description: 'Liste des régions' })
    async getRegions(): Promise<string[]> {
        return await this.locationsService.getRegions();
    }

    @Public()
    @Get('departments')
    @ApiOperation({ summary: 'Lister les 12 départements du Bénin' })
    @ApiResponse({ status: 200, description: 'Liste des départements' })
    async getDepartments(): Promise<string[]> {
        return await this.locationsService.getDepartments();
    }

    @Public()
    @Get('communes')
    @ApiOperation({ summary: 'Lister les communes (filtrable par département)' })
    @ApiQuery({ name: 'department', required: false, example: 'Zou' })
    @ApiResponse({ status: 200, description: 'Liste des communes' })
    async getCommunes(@Query('department') department?: string): Promise<{ department: string; commune: string }[]> {
        return await this.locationsService.getCommunes(department);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lister les zones géographiques, marchés et points de collecte' })
    @ApiQuery({ name: 'department', required: false, example: 'Zou' })
    @ApiQuery({ name: 'search', required: false, example: 'Bohicon' })
    @ApiResponse({ status: 200, description: 'Liste des localités' })
    async findAll(
        @Query('department') department?: string,
        @Query('search') search?: string,
    ): Promise<Location[]> {
        return await this.locationsService.findAll(department, search);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Obtenir le détail d’une localité' })
    @ApiResponse({ status: 200, description: 'Détail de la localité' })
    async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Location | null> {
        return await this.locationsService.findById(id);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.PLATFORM_AGENT)
    @Post()
    @ApiOperation({ summary: 'Ajouter une nouvelle localité ou point de collecte (Admin/Agent)' })
    @ApiResponse({ status: 201, description: 'Localité enregistrée' })
    async create(@Body() dto: CreateLocationDto): Promise<Location> {
        return await this.locationsService.create(dto);
    }
}
