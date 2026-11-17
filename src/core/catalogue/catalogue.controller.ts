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
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CatalogueQueryDto } from './dto/catalogue-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { MeasurementUnit } from './entities/measurement-unit.entity';
import { CatalogueService } from './services/catalogue.service';

@ApiTags('Catalogue')
@Controller()
export class CatalogueController {
    constructor(private readonly catalogueService: CatalogueService) {}

    // ─── UNITÉS ───

    @Public()
    @Get('units')
    @ApiOperation({ summary: 'Lister les unités de mesure autorisées (kg, tonne, sac_50kg, etc.)' })
    @ApiResponse({ status: 200, description: 'Liste des unités' })
    async findAllUnits(): Promise<MeasurementUnit[]> {
        return await this.catalogueService.findAllUnits();
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Post('units')
    @ApiOperation({ summary: 'Créer une unité de mesure (Admin)' })
    @ApiResponse({ status: 201, description: 'Unité créée' })
    async createUnit(@Body() dto: CreateUnitDto): Promise<MeasurementUnit> {
        return await this.catalogueService.createUnit(dto);
    }

    // ─── CATÉGORIES ───

    @Public()
    @Get('categories')
    @ApiOperation({ summary: 'Lister les catégories agricoles avec leurs traductions' })
    @ApiQuery({ name: 'locale', required: false, example: 'fr' })
    @ApiResponse({ status: 200, description: 'Liste des catégories' })
    async findAllCategories(@Query('locale') locale?: string): Promise<any[]> {
        return await this.catalogueService.findAllCategories(locale);
    }

    @Public()
    @Get('categories/:id')
    @ApiOperation({ summary: 'Obtenir le détail d’une catégorie' })
    @ApiQuery({ name: 'locale', required: false, example: 'fr' })
    @ApiResponse({ status: 200, description: 'Détail de la catégorie' })
    async findCategoryById(
        @Param('id') id: string,
        @Query('locale') locale?: string,
    ): Promise<any> {
        return await this.catalogueService.findCategoryById(id, locale);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Post('categories')
    @ApiOperation({ summary: 'Créer une catégorie agricole (Admin)' })
    @ApiResponse({ status: 201, description: 'Catégorie créée' })
    async createCategory(@Body() dto: CreateCategoryDto): Promise<any> {
        return await this.catalogueService.createCategory(dto);
    }

    // ─── PRODUITS ───

    @Public()
    @Get('products')
    @ApiOperation({ summary: 'Explorer le catalogue des produits agricoles' })
    @ApiResponse({ status: 200, description: 'Liste des produits agricoles' })
    async findAllProducts(@Query() query: CatalogueQueryDto): Promise<any[]> {
        return await this.catalogueService.findAllProducts(query);
    }

    @Public()
    @Get('products/:id')
    @ApiOperation({ summary: 'Consulter la fiche technique d’un produit agricole' })
    @ApiQuery({ name: 'locale', required: false, example: 'fr' })
    @ApiResponse({ status: 200, description: 'Fiche produit' })
    async findProductById(
        @Param('id') id: string,
        @Query('locale') locale?: string,
    ): Promise<any> {
        return await this.catalogueService.findProductById(id, locale);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Post('products')
    @ApiOperation({ summary: 'Ajouter un nouveau produit au catalogue (Admin)' })
    @ApiResponse({ status: 201, description: 'Produit créé' })
    async createProduct(@Body() dto: CreateProductDto): Promise<any> {
        return await this.catalogueService.createProduct(dto);
    }
}
