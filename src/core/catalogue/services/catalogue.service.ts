import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CatalogueQueryDto } from '../dto/catalogue-query.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { AgriculturalCategory } from '../entities/agricultural-category.entity';
import { AgriculturalProduct } from '../entities/agricultural-product.entity';
import { CategoryTranslation } from '../entities/category-translation.entity';
import { MeasurementUnit } from '../entities/measurement-unit.entity';
import { ProductTranslation } from '../entities/product-translation.entity';
import { AgriculturalCategoriesRepository } from '../repositories/agricultural-categories.repository';
import { AgriculturalProductsRepository } from '../repositories/agricultural-products.repository';
import { MeasurementUnitsRepository } from '../repositories/measurement-units.repository';

@Injectable()
export class CatalogueService {
    constructor(
        private readonly categoriesRepo: AgriculturalCategoriesRepository,
        private readonly productsRepo: AgriculturalProductsRepository,
        private readonly unitsRepo: MeasurementUnitsRepository,
    ) {}

    // ─── UNITÉS DE MESURE ───

    async createUnit(dto: CreateUnitDto): Promise<MeasurementUnit> {
        const existing = await this.unitsRepo.findOne({
            where: { code: dto.code, deleted: false },
        });
        if (existing) {
            throw new ConflictException(`Unit with code '${dto.code}' already exists`);
        }

        const unit = new MeasurementUnit({
            code: dto.code,
            name: dto.name,
            dimension: dto.dimension ?? 'WEIGHT',
            baseFactor: dto.baseFactor ?? 1,
        });

        return await this.unitsRepo.create(unit);
    }

    async findAllUnits(): Promise<MeasurementUnit[]> {
        return await this.unitsRepo.find({
            where: { deleted: false },
            order: { name: 'ASC' },
        });
    }

    async findUnitById(id: string): Promise<MeasurementUnit> {
        const unit = await this.unitsRepo.findById(id);
        if (!unit) {
            throw new NotFoundException(`Measurement unit with ID ${id} not found`);
        }
        return unit;
    }

    /**
     * Converts a quantity from one unit to another within the same dimension.
     */
    async convertQuantity(
        quantity: number,
        fromUnitId: string,
        toUnitId: string,
    ): Promise<number> {
        if (fromUnitId === toUnitId) return quantity;

        const fromUnit = await this.findUnitById(fromUnitId);
        const toUnit = await this.findUnitById(toUnitId);

        if (fromUnit.dimension !== toUnit.dimension) {
            throw new BadRequestException(
                `Cannot convert between incompatible dimensions: ${fromUnit.dimension} and ${toUnit.dimension}`,
            );
        }

        // Convert to base unit then to target unit
        const inBase = quantity * Number(fromUnit.baseFactor);
        return inBase / Number(toUnit.baseFactor);
    }

    // ─── CATÉGORIES ───

    async createCategory(dto: CreateCategoryDto): Promise<AgriculturalCategory> {
        const existing = await this.categoriesRepo.findOne({
            where: { code: dto.code, deleted: false },
        });
        if (existing) {
            throw new ConflictException(`Category with code '${dto.code}' already exists`);
        }

        let parent: AgriculturalCategory | undefined;
        if (dto.parentId) {
            parent = (await this.categoriesRepo.findById(dto.parentId)) ?? undefined;
        }

        const category = new AgriculturalCategory({
            code: dto.code,
            sortOrder: dto.sortOrder ?? 0,
            isActive: dto.isActive ?? true,
            attributesSchema: dto.attributesSchema ?? [],
            parent,
        });

        category.translations = dto.translations.map(
            (t) =>
                new CategoryTranslation({
                    locale: t.locale,
                    name: t.name,
                    description: t.description,
                }),
        );

        return await this.categoriesRepo.create(category);
    }

    async findAllCategories(locale: string = 'fr'): Promise<any[]> {
        const categories = await this.categoriesRepo.find({
            where: { deleted: false, isActive: true },
            relations: ['translations', 'parent'],
            order: { sortOrder: 'ASC' },
        });

        return categories.map((cat) => this.formatLocalizedCategory(cat, locale));
    }

    async findCategoryById(id: string, locale: string = 'fr'): Promise<any> {
        const category = await this.categoriesRepo.findOne({
            where: { id, deleted: false },
            relations: ['translations', 'parent', 'products'],
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return this.formatLocalizedCategory(category, locale);
    }

    // ─── PRODUITS ───

    async createProduct(dto: CreateProductDto): Promise<AgriculturalProduct> {
        const existing = await this.productsRepo.findOne({
            where: { code: dto.code, deleted: false },
        });
        if (existing) {
            throw new ConflictException(`Product with code '${dto.code}' already exists`);
        }

        const category = await this.categoriesRepo.findById(dto.categoryId);
        if (!category) {
            throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
        }

        let defaultUnit: MeasurementUnit | undefined;
        if (dto.defaultUnitId) {
            defaultUnit = (await this.unitsRepo.findById(dto.defaultUnitId)) ?? undefined;
        }

        const product = new AgriculturalProduct({
            code: dto.code,
            category,
            defaultUnit,
            isActive: dto.isActive ?? true,
        });

        product.translations = dto.translations.map(
            (t) =>
                new ProductTranslation({
                    locale: t.locale,
                    name: t.name,
                    description: t.description,
                }),
        );

        return await this.productsRepo.create(product);
    }

    async findAllProducts(query: CatalogueQueryDto): Promise<any[]> {
        const locale = query.locale ?? 'fr';
        const qb = this.productsRepo
            .getRepository()
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('category.translations', 'catTrans')
            .leftJoinAndSelect('product.defaultUnit', 'defaultUnit')
            .leftJoinAndSelect('product.translations', 'trans')
            .where('product.deleted = :deleted', { deleted: false })
            .andWhere('product.isActive = :isActive', { isActive: true });

        if (query.category) {
            qb.andWhere(
                '(category.id = :catId OR category.code = :catCode)',
                { catId: query.category, catCode: query.category },
            );
        }

        if (query.search) {
            qb.andWhere('LOWER(trans.name) LIKE LOWER(:search)', {
                search: `%${query.search}%`,
            });
        }

        const products = await qb.orderBy('product.createdAt', 'ASC').getMany();
        return products.map((prod) => this.formatLocalizedProduct(prod, locale));
    }

    async findProductById(id: string, locale: string = 'fr'): Promise<any> {
        const product = await this.productsRepo.findOne({
            where: { id, deleted: false },
            relations: ['category', 'category.translations', 'defaultUnit', 'translations'],
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return this.formatLocalizedProduct(product, locale);
    }

    // ─── LOCALIZATION HELPERS ───

    private formatLocalizedCategory(cat: AgriculturalCategory, locale: string) {
        const trans =
            cat.translations?.find((t) => t.locale === locale) ??
            cat.translations?.find((t) => t.locale === 'fr') ??
            cat.translations?.[0];

        return {
            id: cat.id,
            code: cat.code,
            name: trans?.name ?? cat.code,
            description: trans?.description ?? '',
            sortOrder: cat.sortOrder,
            attributesSchema: cat.attributesSchema,
            parentId: cat.parent?.id ?? null,
            translations: cat.translations,
        };
    }

    private formatLocalizedProduct(prod: AgriculturalProduct, locale: string) {
        const trans =
            prod.translations?.find((t) => t.locale === locale) ??
            prod.translations?.find((t) => t.locale === 'fr') ??
            prod.translations?.[0];

        return {
            id: prod.id,
            code: prod.code,
            name: trans?.name ?? prod.code,
            description: trans?.description ?? '',
            category: prod.category
                ? this.formatLocalizedCategory(prod.category, locale)
                : null,
            defaultUnit: prod.defaultUnit
                ? {
                      id: prod.defaultUnit.id,
                      code: prod.defaultUnit.code,
                      name: prod.defaultUnit.name,
                      baseFactor: Number(prod.defaultUnit.baseFactor),
                  }
                : null,
            translations: prod.translations,
        };
    }
}
