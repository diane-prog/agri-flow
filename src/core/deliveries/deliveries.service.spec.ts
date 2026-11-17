import { ForbiddenException } from '@nestjs/common';
import { DeliveryStatusEnum, OrderStatusEnum } from '../../common/enum';
import { DeliveriesService } from './deliveries.service';

describe('DeliveriesService', () => {
    let service: DeliveriesService;
    let mockDeliveriesRepo: any;
    let mockOrdersRepo: any;
    let mockLocationsRepo: any;
    let mockUsersRepo: any;
    let mockOrdersService: any;

    beforeEach(() => {
        mockDeliveriesRepo = {
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn().mockImplementation((d) => Promise.resolve(d)),
            save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
        };

        mockOrdersRepo = {
            findById: jest.fn(),
        };

        mockOrdersService = {
            updateStatus: jest.fn().mockResolvedValue(undefined),
        };

        service = new DeliveriesService(
            mockDeliveriesRepo,
            mockOrdersRepo,
            mockLocationsRepo,
            mockUsersRepo,
            mockOrdersService,
        );
    });

    it('should dispatch delivery and sync order status to DISPATCHED', async () => {
        const fakeDelivery = {
            id: 'del-1',
            order: {
                id: 'order-1',
                sellerUser: { id: 'seller-1' },
            },
            status: DeliveryStatusEnum.PENDING,
        };

        mockDeliveriesRepo.findById.mockResolvedValue(fakeDelivery);

        const result = await service.dispatch('del-1', 'seller-1', {
            quantityDispatched: 10,
        });

        expect(result.status).toBe(DeliveryStatusEnum.IN_TRANSIT);
        expect(result.quantityDispatched).toBe(10);
        expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
            'order-1',
            OrderStatusEnum.DISPATCHED,
            'seller-1',
            expect.stringContaining('10 unités'),
        );
    });

    it('should reject dispatch if caller is not the seller', async () => {
        const fakeDelivery = {
            id: 'del-1',
            order: {
                id: 'order-1',
                sellerUser: { id: 'seller-1' },
            },
        };

        mockDeliveriesRepo.findById.mockResolvedValue(fakeDelivery);

        await expect(
            service.dispatch('del-1', 'intruder-id', { quantityDispatched: 10 }),
        ).rejects.toThrow(ForbiddenException);
    });

    it('should confirm receipt and complete order', async () => {
        const fakeDelivery = {
            id: 'del-1',
            order: {
                id: 'order-1',
                buyerUser: { id: 'buyer-1' },
            },
            status: DeliveryStatusEnum.IN_TRANSIT,
        };

        mockDeliveriesRepo.findById.mockResolvedValue(fakeDelivery);

        const result = await service.confirmReceipt('del-1', 'buyer-1', {
            quantityReceived: 10,
            proofUrl: 'https://s3.agriflow.bj/bl/bl-123.jpg',
        });

        expect(result.status).toBe(DeliveryStatusEnum.ACCEPTED);
        expect(result.quantityReceived).toBe(10);
        expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
            'order-1',
            OrderStatusEnum.COMPLETED,
            'buyer-1',
            expect.stringContaining('10 unités'),
        );
    });
});
