import { OfferStatusEnum } from '../../common/enum';
import { OffersService } from './offers.service';

describe('OffersService - Negotiation & Order Generation', () => {
    let service: OffersService;
    let mockOffersRepo: any;
    let mockRevisionsRepo: any;
    let mockListingsRepo: any;
    let mockRequestsRepo: any;
    let mockUnitsRepo: any;
    let mockUsersRepo: any;
    let mockListingsService: any;
    let mockRequestsService: any;
    let mockOrdersService: any;
    let mockAggregationService: any;
    let mockManager: any;

    beforeEach(() => {
        mockManager = {
            transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
            save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        };

        mockOffersRepo = {
            getManager: jest.fn().mockReturnValue(mockManager),
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
            save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        };

        mockRevisionsRepo = {
            create: jest.fn().mockImplementation((rev) => Promise.resolve(rev)),
        };

        mockListingsService = {
            reserveQuantity: jest.fn().mockResolvedValue(undefined),
        };

        mockOrdersService = {
            createFromOffer: jest.fn().mockResolvedValue({
                id: 'order-1',
                reference: 'AGR-202611-12345',
            }),
        };

        mockRequestsService = {
            fulfillQuantity: jest.fn().mockResolvedValue(undefined),
        };

        mockAggregationService = {
            recordFulfillment: jest.fn().mockResolvedValue(undefined),
        };

        mockUsersRepo = {
            findById: jest.fn().mockImplementation((id) => Promise.resolve({ id, name: 'User' })),
        };

        service = new OffersService(
            mockOffersRepo,
            mockRevisionsRepo,
            mockListingsRepo,
            mockRequestsRepo,
            mockUnitsRepo,
            mockUsersRepo,
            mockListingsService,
            mockRequestsService,
            mockOrdersService,
            mockAggregationService,
        );
    });

    it('should counter an offer and append revision 2 without overwriting history', async () => {
        const existingOffer = {
            id: 'offer-1',
            quantity: 5,
            unitPrice: 150000,
            currency: 'XOF',
            status: OfferStatusEnum.PENDING,
            buyerUser: { id: 'buyer-1' },
            sellerUser: { id: 'seller-1' },
            revisions: [{ revisionNumber: 1, quantity: 5, unitPrice: 150000 }],
        };

        mockOffersRepo.findById.mockResolvedValue(existingOffer);

        const result = await service.counter('offer-1', 'seller-1', {
            quantity: 5,
            unitPrice: 145000,
            notes: 'Mon dernier prix est 145.000 FCFA',
        });

        expect(result.status).toBe(OfferStatusEnum.COUNTERED);
        expect(result.unitPrice).toBe(145000);
        expect(mockRevisionsRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                revisionNumber: 2,
                unitPrice: 145000,
            }),
        );
    });

    it('should accept an offer, reserve stock atomically, and create order', async () => {
        const existingOffer = {
            id: 'offer-1',
            quantity: 4,
            unitPrice: 140000,
            status: OfferStatusEnum.PENDING,
            buyerUser: { id: 'buyer-1' },
            sellerUser: { id: 'seller-1' },
            listing: { id: 'listing-1' },
        };

        mockOffersRepo.findById.mockResolvedValue(existingOffer);

        const result = await service.accept('offer-1', 'seller-1');

        expect(result.offer.status).toBe(OfferStatusEnum.ACCEPTED);
        expect(mockListingsService.reserveQuantity).toHaveBeenCalledWith('listing-1', 4, mockManager);
        expect(mockOrdersService.createFromOffer).toHaveBeenCalledWith(existingOffer, mockManager);
        expect(result.order.reference).toBe('AGR-202611-12345');
    });

    it('should record aggregation fulfillment when accepting an offer on a purchase request', async () => {
        const existingOffer = {
            id: 'offer-2',
            quantity: 15,
            unitPrice: 138000,
            status: OfferStatusEnum.PENDING,
            buyerUser: { id: 'buyer-1' },
            sellerUser: { id: 'seller-2' },
            purchaseRequest: { id: 'request-1' },
        };

        mockOffersRepo.findById.mockResolvedValue(existingOffer);

        const result = await service.accept('offer-2', 'buyer-1');

        expect(result.offer.status).toBe(OfferStatusEnum.ACCEPTED);
        expect(mockRequestsService.fulfillQuantity).toHaveBeenCalledWith('request-1', 15, mockManager);
        expect(mockAggregationService.recordFulfillment).toHaveBeenCalledWith(
            existingOffer.purchaseRequest,
            existingOffer,
            expect.anything(),
            15,
            mockManager,
        );
    });
});
