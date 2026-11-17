import { BadRequestException } from '@nestjs/common';
import { ListingStatusEnum } from '../../common/enum';
import { ListingsService } from './listings.service';

describe('ListingsService - Atomic Stock Reservation', () => {
    let service: ListingsService;
    let mockListingsRepo: any;
    let mockProductsRepo: any;
    let mockLocationsRepo: any;
    let mockUnitsRepo: any;
    let mockUsersRepo: any;
    let mockManager: any;

    beforeEach(() => {
        mockManager = {
            transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
            createQueryBuilder: jest.fn(),
            save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        };

        mockListingsRepo = {
            getManager: jest.fn().mockReturnValue(mockManager),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        service = new ListingsService(
            mockListingsRepo,
            mockProductsRepo,
            mockLocationsRepo,
            mockUnitsRepo,
            mockUsersRepo,
        );
    });

    it('should reserve quantity successfully when sufficient stock is available', async () => {
        const fakeListing = {
            id: 'listing-1',
            quantity: 10,
            reservedQuantity: 2,
            status: ListingStatusEnum.ACTIVE,
        };

        const qb: any = {
            setLock: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(fakeListing),
        };
        mockManager.createQueryBuilder.mockReturnValue(qb);

        const result = await service.reserveQuantity('listing-1', 4, mockManager);

        expect(result.reservedQuantity).toBe(6);
        expect(result.status).toBe(ListingStatusEnum.ACTIVE);
        expect(mockManager.save).toHaveBeenCalledWith(fakeListing);
    });

    it('should transition to RESERVED when all available quantity is reserved', async () => {
        const fakeListing = {
            id: 'listing-1',
            quantity: 10,
            reservedQuantity: 6,
            status: ListingStatusEnum.ACTIVE,
        };

        const qb: any = {
            setLock: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(fakeListing),
        };
        mockManager.createQueryBuilder.mockReturnValue(qb);

        const result = await service.reserveQuantity('listing-1', 4, mockManager);

        expect(result.reservedQuantity).toBe(10);
        expect(result.status).toBe(ListingStatusEnum.RESERVED);
    });

    it('should reject reservation and throw BadRequestException if stock is insufficient', async () => {
        const fakeListing = {
            id: 'listing-1',
            quantity: 10,
            reservedQuantity: 8,
            status: ListingStatusEnum.ACTIVE,
        };

        const qb: any = {
            setLock: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(fakeListing),
        };
        mockManager.createQueryBuilder.mockReturnValue(qb);

        await expect(
            service.reserveQuantity('listing-1', 5, mockManager),
        ).rejects.toThrow(BadRequestException);
    });

    it('should release quantity and restore ACTIVE status', async () => {
        const fakeListing = {
            id: 'listing-1',
            quantity: 10,
            reservedQuantity: 10,
            status: ListingStatusEnum.RESERVED,
        };

        const qb: any = {
            setLock: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(fakeListing),
        };
        mockManager.createQueryBuilder.mockReturnValue(qb);

        const result = await service.releaseQuantity('listing-1', 3, mockManager);

        expect(result.reservedQuantity).toBe(7);
        expect(result.status).toBe(ListingStatusEnum.ACTIVE);
    });
});
