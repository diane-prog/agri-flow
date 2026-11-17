import { VerificationLevelEnum } from '../../common/enum';
import { AdminService } from './admin.service';

describe('AdminService - Supervision & Audit Logs', () => {
    let service: AdminService;
    let mockAuditLogsRepo: any;
    let mockUsersRepo: any;
    let mockListingsRepo: any;
    let mockOrdersRepo: any;
    let mockRequestsRepo: any;

    beforeEach(() => {
        mockAuditLogsRepo = {
            create: jest.fn().mockImplementation((log) => Promise.resolve(log)),
            find: jest.fn(),
        };

        mockUsersRepo = {
            findById: jest.fn(),
            save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
            count: jest.fn().mockResolvedValue(120),
        };

        mockListingsRepo = {
            count: jest.fn().mockResolvedValue(45),
            findById: jest.fn(),
            save: jest.fn().mockImplementation((l) => Promise.resolve(l)),
        };

        mockRequestsRepo = {
            count: jest.fn().mockResolvedValue(18),
        };

        mockOrdersRepo = {
            count: jest.fn().mockResolvedValue(30),
            find: jest.fn().mockResolvedValue([
                { id: 'order-1', subtotal: 1500000 },
                { id: 'order-2', subtotal: 2500000 },
            ]),
        };

        service = new AdminService(
            mockAuditLogsRepo,
            mockUsersRepo,
            mockListingsRepo,
            mockOrdersRepo,
            mockRequestsRepo,
        );
    });

    it('should calculate commercial volume in XOF and conversion rate accurately', async () => {
        const stats = await service.getDashboardStats();

        expect(stats.users.total).toBe(120);
        expect(stats.marketplace.activeListings).toBe(45);
        expect(stats.marketplace.openRequests).toBe(18);
        expect(stats.marketplace.completedOrders).toBe(2);
        expect(stats.marketplace.totalCommercialVolumeXof).toBe(4000000); // 1.5M + 2.5M
        expect(stats.marketplace.conversionRatePercent).toBe(6.7); // (2/30) * 100
    });

    it('should verify user KYC level and write an entry into audit_logs', async () => {
        const fakeUser = {
            id: 'user-1',
            verificationLevel: VerificationLevelEnum.LEVEL_0,
        };
        mockUsersRepo.findById.mockResolvedValue(fakeUser);

        const updated = await service.verifyUser('user-1', 'admin-1', {
            verificationLevel: VerificationLevelEnum.LEVEL_1,
            notes: 'CIP vérifiée conforme',
        });

        expect(updated.verificationLevel).toBe(VerificationLevelEnum.LEVEL_1);
        expect(mockAuditLogsRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                action: 'USER_KYC_VERIFIED',
                entityType: 'USER',
                entityId: 'user-1',
            }),
        );
    });

    it('should suspend a user account and write an entry into audit_logs', async () => {
        const fakeUser = {
            id: 'user-2',
            status: 'ACTIVE',
        };
        mockUsersRepo.findById.mockResolvedValue(fakeUser);

        const updated = await service.suspendUser('user-2', 'admin-1', 'Tentative de fraude');

        expect(updated.status).toBe('SUSPENDED');
        expect(mockAuditLogsRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                action: 'USER_SUSPENDED',
                entityType: 'USER',
                entityId: 'user-2',
                metadata: { reason: 'Tentative de fraude' },
            }),
        );
    });
});
