import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { AgriculturalCategory } from './entities/agricultural-category.entity';
import { AgriculturalProduct } from './entities/agricultural-product.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { MeasurementUnit } from './entities/measurement-unit.entity';
import { ProductTranslation } from './entities/product-translation.entity';
import { AgriculturalCategoriesRepository } from './repositories/agricultural-categories.repository';
import { AgriculturalProductsRepository } from './repositories/agricultural-products.repository';
import { CategoryTranslationsRepository } from './repositories/category-translations.repository';
import { MeasurementUnitsRepository } from './repositories/measurement-units.repository';
import { ProductTranslationsRepository } from './repositories/product-translations.repository';
import { CatalogueController } from './catalogue.controller';
import { CatalogueSeederService } from './services/catalogue-seeder.service';
import { CatalogueService } from './services/catalogue.service';

@Module({
    imports: [
        DatabaseModule.forFeature([
            MeasurementUnit,
            AgriculturalCategory,
            CategoryTranslation,
            AgriculturalProduct,
            ProductTranslation,
        ]),
    ],
    controllers: [CatalogueController],
    providers: [
        MeasurementUnitsRepository,
        AgriculturalCategoriesRepository,
        CategoryTranslationsRepository,
        AgriculturalProductsRepository,
        ProductTranslationsRepository,
        CatalogueService,
        CatalogueSeederService,
    ],
    exports: [
        CatalogueService,
        MeasurementUnitsRepository,
        AgriculturalCategoriesRepository,
        AgriculturalProductsRepository,
    ],
})
export class CatalogueModule {}
