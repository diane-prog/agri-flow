import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationRoleEnum, OrganizationTypeEnum, UserRoleEnum, VerificationLevelEnum } from '../../common/enum';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { Location } from '../locations/entities/location.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { OrganizationInvitation } from './entities/organization-invitation.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './services/organizations.service';

describe('OrganizationsService', () => {
    let service: OrganizationsService;

    const mockUser: User = {
        id: 'u-1',
        phone: '+22997000001',
        firstName: 'Bio',
        lastName: 'Sanni',
        verificationLevel: VerificationLevelEnum.LEVEL_1,
        isSuspended: false,
        country: 'BJ',
        preferredLanguage: 'fr',
    } as any;

    const mockOrgRepo = {
        create: jest.fn().mockImplementation((dto) => ({ id: 'org-1', ...dto })),
        save: jest.fn().mockImplementation(async (item) => ({ id: 'org-1', ...item })),
        findOne: jest.fn().mockImplementation(async ({ where }) => {
            if (where.id === 'org-1') {
                return {
                    id: 'org-1',
                    name: 'Coopérative Maraîchère',
                    creator: mockUser,
                };
            }
            return null;
        }),
    };

    const mockMemberRepo = {
        create: jest.fn().mockImplementation((dto) => ({ id: 'mem-1', ...dto })),
        save: jest.fn().mockImplementation(async (item) => ({ id: 'mem-1', ...item })),
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue({
            id: 'mem-1',
            role: OrganizationRoleEnum.OWNER,
            isActive: true,
            user: mockUser,
        }),
    };

    const mockInvitationRepo = {
        create: jest.fn().mockImplementation((dto) => ({ id: 'inv-1', ...dto })),
        save: jest.fn().mockImplementation(async (item) => ({ id: 'inv-1', ...item })),
        findOne: jest.fn(),
    };

    const mockLocationRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 'loc-1', name: 'Bohicon' }),
    };

    const mockUserRoleRepo = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((dto) => dto),
        save: jest.fn().mockResolvedValue({}),
    };

    const mockAuditLogRepo = {
        create: jest.fn().mockImplementation((dto) => dto),
        save: jest.fn().mockResolvedValue({}),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrganizationsService,
                { provide: getRepositoryToken(Organization), useValue: mockOrgRepo },
                { provide: getRepositoryToken(OrganizationMember), useValue: mockMemberRepo },
                { provide: getRepositoryToken(OrganizationInvitation), useValue: mockInvitationRepo },
                { provide: getRepositoryToken(Location), useValue: mockLocationRepo },
                { provide: getRepositoryToken(UserRole), useValue: mockUserRoleRepo },
                { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepo },
            ],
        }).compile();

        service = module.get<OrganizationsService>(OrganizationsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create an organization and assign creator as OWNER', async () => {
        const result = await service.createOrganization(mockUser, {
            name: 'Coopérative Maraîchère',
            type: OrganizationTypeEnum.COOPERATIVE,
            phone: '+22997000001',
        });

        expect(result.id).toBe('org-1');
        expect(mockMemberRepo.save).toHaveBeenCalled();
        expect(mockAuditLogRepo.save).toHaveBeenCalled();
    });

    it('should invite a member with a generated token', async () => {
        const result = await service.inviteMember('org-1', mockUser, {
            phone: '+22997112233',
            role: OrganizationRoleEnum.MEMBER,
            title: 'Trésorier',
        });

        expect(result.phone).toBe('+22997112233');
        expect(result.token).toBeDefined();
    });
});
