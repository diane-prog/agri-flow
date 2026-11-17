import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { AgriculturalCategoriesRepository } from '../repositories/agricultural-categories.repository';
import { MeasurementUnitsRepository } from '../repositories/measurement-units.repository';

@Injectable()
export class CatalogueSeederService implements OnApplicationBootstrap {
    private readonly logger = new Logger(CatalogueSeederService.name);

    constructor(
        private readonly catalogueService: CatalogueService,
        private readonly categoriesRepo: AgriculturalCategoriesRepository,
        private readonly unitsRepo: MeasurementUnitsRepository,
    ) {}

    async onApplicationBootstrap() {
        await this.seedCatalogue();
    }

    async seedCatalogue() {
        try {
            const unitsCount = await this.unitsRepo.count();
            if (unitsCount === 0) {
                await this.seedUnits();
            }

            const catCount = await this.categoriesRepo.count();
            if (catCount === 0) {
                await this.seedCategoriesAndProducts();
            }
        } catch (error) {
            this.logger.warn(`Catalogue seeder skipped: ${error.message}`);
        }
    }

    private async seedUnits() {
        const units = [
            { code: 'kg', name: 'Kilogramme', dimension: 'WEIGHT', baseFactor: 1 },
            { code: 'tonne', name: 'Tonne métrique', dimension: 'WEIGHT', baseFactor: 1000 },
            { code: 'sac_50kg', name: 'Sac de 50 kg', dimension: 'WEIGHT', baseFactor: 50 },
            { code: 'sac_100kg', name: 'Sac de 100 kg', dimension: 'WEIGHT', baseFactor: 100 },
            { code: 'bassine', name: 'Bassine', dimension: 'WEIGHT', baseFactor: 25 },
            { code: 'carton', name: 'Carton', dimension: 'UNIT', baseFactor: 1 },
            { code: 'unite', name: 'Tête / Unité', dimension: 'UNIT', baseFactor: 1 },
        ];

        for (const u of units) {
            await this.catalogueService.createUnit(u);
        }
        this.logger.log('✅ Unités de mesure agricoles créées avec succès.');
    }

    private async seedCategoriesAndProducts() {
        const units = await this.catalogueService.findAllUnits();
        const kgUnit = units.find((u) => u.code === 'kg');
        const tonneUnit = units.find((u) => u.code === 'tonne');
        const sac50Unit = units.find((u) => u.code === 'sac_50kg');
        const unitUnit = units.find((u) => u.code === 'unite');

        const catalogData = [
            {
                code: 'cereals',
                sortOrder: 1,
                translations: [
                    { locale: 'fr', name: 'Céréales', description: 'Maïs, riz, sorgho, mil' },
                    { locale: 'fon', name: 'Gbadoli kpo Molun kpo', description: '' },
                    { locale: 'en', name: 'Cereals', description: 'Maize, rice, sorghum, millet' },
                ],
                attributesSchema: [
                    { key: 'humidity_max', label: 'Humidité maximale (%)', type: 'number', required: true },
                    { key: 'variety', label: 'Variété', type: 'string', required: false },
                    { key: 'drying_state', label: 'État de séchage', type: 'enum', options: ['Sec', 'Très sec', 'Frais'], required: true },
                ],
                products: [
                    {
                        code: 'maize_white',
                        defaultUnitId: sac50Unit?.id ?? kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Maïs blanc', description: 'Grains secs propres calibrés' },
                            { locale: 'fon', name: 'Gbadoli wéwé', description: '' },
                            { locale: 'en', name: 'White maize', description: 'Dried white corn' },
                        ],
                    },
                    {
                        code: 'maize_yellow',
                        defaultUnitId: sac50Unit?.id ?? kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Maïs jaune', description: 'Maïs jaune riche en provitamine A' },
                            { locale: 'fon', name: 'Gbadoli kokloé', description: '' },
                            { locale: 'en', name: 'Yellow maize', description: 'Dried yellow corn' },
                        ],
                    },
                    {
                        code: 'rice_paddy',
                        defaultUnitId: tonneUnit?.id ?? kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Riz paddy', description: 'Riz non décortiqué des bas-fonds' },
                            { locale: 'fon', name: 'Molun dinto', description: '' },
                            { locale: 'en', name: 'Paddy rice', description: 'Raw unprocessed rice' },
                        ],
                    },
                ],
            },
            {
                code: 'legumes',
                sortOrder: 2,
                translations: [
                    { locale: 'fr', name: 'Légumineuses', description: 'Soja, niébé, arachide' },
                    { locale: 'fon', name: 'Ayikun kpo Azin kpo', description: '' },
                    { locale: 'en', name: 'Legumes / Pulses', description: 'Soybeans, cowpeas, peanuts' },
                ],
                attributesSchema: [
                    { key: 'humidity_max', label: 'Teneur en eau max (%)', type: 'number', required: true },
                    { key: 'grade', label: 'Calibre / Grade', type: 'string', required: false },
                ],
                products: [
                    {
                        code: 'soybean',
                        defaultUnitId: tonneUnit?.id ?? kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Soja conventionnel / Bio', description: 'Graines de soja sec trié' },
                            { locale: 'fon', name: 'Soja', description: '' },
                            { locale: 'en', name: 'Soybean', description: 'Clean dried soybeans' },
                        ],
                    },
                    {
                        code: 'cowpea',
                        defaultUnitId: sac50Unit?.id ?? kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Niébé (Haricot)', description: 'Haricot rouge / blanc' },
                            { locale: 'fon', name: 'Ayikun', description: '' },
                            { locale: 'en', name: 'Cowpea', description: 'Dry black-eyed beans' },
                        ],
                    },
                ],
            },
            {
                code: 'fruits',
                sortOrder: 3,
                translations: [
                    { locale: 'fr', name: 'Fruits', description: 'Ananas, mangue, orange, papaye' },
                    { locale: 'fon', name: 'Atinsinsin', description: '' },
                    { locale: 'en', name: 'Fruits', description: 'Pineapple, mango, orange, papaya' },
                ],
                attributesSchema: [
                    { key: 'variety', label: 'Variété', type: 'string', required: true },
                    { key: 'ripeness', label: 'Stade de maturité', type: 'string', required: false },
                ],
                products: [
                    {
                        code: 'pineapple_sugarloaf',
                        defaultUnitId: kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Ananas Pain de Sucre', description: 'Ananas doux labelisé du plateau d\'Allada' },
                            { locale: 'fon', name: 'Aglomadji', description: '' },
                            { locale: 'en', name: 'Sugarloaf Pineapple', description: 'Sweet sugarloaf pineapple from Allada' },
                        ],
                    },
                ],
            },
            {
                code: 'tubers',
                sortOrder: 4,
                translations: [
                    { locale: 'fr', name: 'Racines et tubercules', description: 'Manioc, igname, patate douce' },
                    { locale: 'fon', name: 'Tégbé kpo Flin kpo', description: '' },
                    { locale: 'en', name: 'Roots and tubers', description: 'Cassava, yam, sweet potato' },
                ],
                attributesSchema: [
                    { key: 'freshness', label: 'Fraîcheur', type: 'string', required: true },
                ],
                products: [
                    {
                        code: 'yam_laboko',
                        defaultUnitId: kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Igname Laboko', description: 'Igname de qualité supérieure de Savalou / Glazoué' },
                            { locale: 'fon', name: 'Tégbé Laboko', description: '' },
                            { locale: 'en', name: 'Laboko Yam', description: 'Premium fresh yam' },
                        ],
                    },
                ],
            },
            {
                code: 'processed',
                sortOrder: 5,
                translations: [
                    { locale: 'fr', name: 'Produits transformés', description: 'Gari, huile de palme, farines, jus' },
                    { locale: 'fon', name: 'Nǔ é blo le', description: '' },
                    { locale: 'en', name: 'Processed food', description: 'Gari, palm oil, flours, juices' },
                ],
                attributesSchema: [
                    { key: 'origin', label: 'Région de transformation', type: 'string', required: false },
                ],
                products: [
                    {
                        code: 'gari_sohoui',
                        defaultUnitId: sac50Unit?.id ?? kgUnit?.id,
                        translations: [
                            { locale: 'fr', name: 'Gari Sohoui', description: 'Farine de manioc torréfiée fine et croquante' },
                            { locale: 'fon', name: 'Gari sohoui', description: '' },
                            { locale: 'en', name: 'Gari Sohoui', description: 'Crispy roasted cassava flakes' },
                        ],
                    },
                ],
            },
        ];

        for (const item of catalogData) {
            const category = await this.catalogueService.createCategory({
                code: item.code,
                sortOrder: item.sortOrder,
                translations: item.translations,
                attributesSchema: item.attributesSchema,
            });

            for (const prod of item.products) {
                await this.catalogueService.createProduct({
                    code: prod.code,
                    categoryId: category.id,
                    defaultUnitId: prod.defaultUnitId,
                    translations: prod.translations,
                });
            }
        }

        this.logger.log('✅ Catalogue agricole du Bénin initialisé avec succès (Catégories et Produits).');
    }
}
