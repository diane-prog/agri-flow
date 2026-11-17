import { CatalogueService } from './catalogue.service';

describe('CatalogueService', () => {
    let service: CatalogueService;
    let mockCategoriesRepo: any;
    let mockProductsRepo: any;
    let mockUnitsRepo: any;

    beforeEach(() => {
        mockCategoriesRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
        };
        mockProductsRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            getRepository: jest.fn(),
        };
        mockUnitsRepo = {
            findById: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
        };

        service = new CatalogueService(
            mockCategoriesRepo,
            mockProductsRepo,
            mockUnitsRepo,
        );
    });

    it('should convert 2 tonnes to 2000 kg', async () => {
        const tonneUnit = {
            id: 'tonne-id',
            code: 'tonne',
            name: 'Tonne',
            dimension: 'WEIGHT',
            baseFactor: 1000,
        };
        const kgUnit = {
            id: 'kg-id',
            code: 'kg',
            name: 'Kilogramme',
            dimension: 'WEIGHT',
            baseFactor: 1,
        };

        mockUnitsRepo.findById.mockImplementation((id: string) => {
            if (id === 'tonne-id') return Promise.resolve(tonneUnit);
            if (id === 'kg-id') return Promise.resolve(kgUnit);
            return Promise.resolve(null);
        });

        const result = await service.convertQuantity(2, 'tonne-id', 'kg-id');
        expect(result).toBe(2000);
    });

    it('should convert 10 sacs of 50kg to 0.5 tonne', async () => {
        const sacUnit = {
            id: 'sac-id',
            code: 'sac_50kg',
            name: 'Sac 50kg',
            dimension: 'WEIGHT',
            baseFactor: 50,
        };
        const tonneUnit = {
            id: 'tonne-id',
            code: 'tonne',
            name: 'Tonne',
            dimension: 'WEIGHT',
            baseFactor: 1000,
        };

        mockUnitsRepo.findById.mockImplementation((id: string) => {
            if (id === 'sac-id') return Promise.resolve(sacUnit);
            if (id === 'tonne-id') return Promise.resolve(tonneUnit);
            return Promise.resolve(null);
        });

        // 10 * 50 = 500kg -> 500 / 1000 = 0.5 tonne
        const result = await service.convertQuantity(10, 'sac-id', 'tonne-id');
        expect(result).toBe(0.5);
    });

    it('should return same quantity when units are identical', async () => {
        const result = await service.convertQuantity(50, 'unit-1', 'unit-1');
        expect(result).toBe(50);
        expect(mockUnitsRepo.findById).not.toHaveBeenCalled();
    });
});
