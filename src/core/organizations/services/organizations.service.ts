import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import {
    InvitationStatusEnum,
    OrganizationRoleEnum,
    OrganizationVerificationStatusEnum,
    UserRoleEnum,
} from '../../../common/enum';
import { AuditLog } from '../../admin/entities/audit-log.entity';
import { Location } from '../../locations/entities/location.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { User } from '../../users/entities/user.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationInvitation } from '../entities/organization-invitation.entity';
import { OrganizationMember } from '../entities/organization-member.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepo: Repository<Organization>,
        @InjectRepository(OrganizationMember)
        private readonly memberRepo: Repository<OrganizationMember>,
        @InjectRepository(OrganizationInvitation)
        private readonly invitationRepo: Repository<OrganizationInvitation>,
        @InjectRepository(Location)
        private readonly locationRepo: Repository<Location>,
        @InjectRepository(UserRole)
        private readonly userRoleRepo: Repository<UserRole>,
        @InjectRepository(AuditLog)
        private readonly auditLogRepo: Repository<AuditLog>,
    ) {}

    async createOrganization(user: User, dto: CreateOrganizationDto): Promise<Organization> {
        let location: Location | undefined;
        if (dto.locationId) {
            location = await this.locationRepo.findOne({ where: { id: dto.locationId } });
            if (!location) {
                throw new NotFoundException(`Localisation introuvable: ${dto.locationId}`);
            }
        }

        const org = this.organizationRepo.create({
            name: dto.name,
            legalName: dto.legalName,
            type: dto.type,
            registrationNumber: dto.registrationNumber,
            description: dto.description,
            email: dto.email,
            phone: dto.phone,
            address: dto.address,
            location,
            creator: user,
            verificationStatus: OrganizationVerificationStatusEnum.PENDING,
            verificationDocuments: [],
        });

        const savedOrg = await this.organizationRepo.save(org);

        // Assign user as OWNER
        const member = this.memberRepo.create({
            organization: savedOrg,
            user,
            role: OrganizationRoleEnum.OWNER,
            title: 'Fondateur / Propriétaire',
            isActive: true,
        });
        await this.memberRepo.save(member);

        // Ensure user has ORGANIZATION_OWNER role
        const existingRole = await this.userRoleRepo.findOne({
            where: { user: { id: user.id }, role: UserRoleEnum.ORGANIZATION_OWNER },
        });
        if (!existingRole) {
            await this.userRoleRepo.save(
                this.userRoleRepo.create({
                    user,
                    role: UserRoleEnum.ORGANIZATION_OWNER,
                }),
            );
        }

        // Audit log
        await this.auditLogRepo.save(
            this.auditLogRepo.create({
                actorUser: user,
                action: 'ORGANIZATION_CREATED',
                entityType: 'Organization',
                entityId: savedOrg.id,
                metadata: { name: savedOrg.name, type: savedOrg.type },
            }),
        );

        return savedOrg;
    }

    async findUserOrganizations(userId: string): Promise<Organization[]> {
        const memberships = await this.memberRepo.find({
            where: { user: { id: userId }, isActive: true },
            relations: ['organization', 'organization.location'],
        });
        return memberships.map((m) => m.organization);
    }

    async findById(id: string): Promise<Organization> {
        const org = await this.organizationRepo.findOne({
            where: { id },
            relations: ['creator', 'location', 'members', 'members.user', 'farms'],
        });
        if (!org) {
            throw new NotFoundException(`Organisation ${id} introuvable`);
        }
        return org;
    }

    async updateOrganization(id: string, user: User, dto: UpdateOrganizationDto): Promise<Organization> {
        const org = await this.findById(id);

        const membership = await this.memberRepo.findOne({
            where: { organization: { id }, user: { id: user.id }, isActive: true },
        });

        if (!membership || (membership.role !== OrganizationRoleEnum.OWNER && membership.role !== OrganizationRoleEnum.ADMIN)) {
            throw new ForbiddenException("Seuls les propriétaires ou administrateurs de l'organisation peuvent la modifier.");
        }

        if (dto.locationId) {
            const loc = await this.locationRepo.findOne({ where: { id: dto.locationId } });
            if (!loc) throw new NotFoundException(`Localisation ${dto.locationId} introuvable`);
            org.location = loc;
        }

        if (dto.name !== undefined) org.name = dto.name;
        if (dto.legalName !== undefined) org.legalName = dto.legalName;
        if (dto.type !== undefined) org.type = dto.type;
        if (dto.registrationNumber !== undefined) org.registrationNumber = dto.registrationNumber;
        if (dto.description !== undefined) org.description = dto.description;
        if (dto.email !== undefined) org.email = dto.email;
        if (dto.phone !== undefined) org.phone = dto.phone;
        if (dto.address !== undefined) org.address = dto.address;

        const updated = await this.organizationRepo.save(org);

        await this.auditLogRepo.save(
            this.auditLogRepo.create({
                actorUser: user,
                action: 'ORGANIZATION_UPDATED',
                entityType: 'Organization',
                entityId: updated.id,
                metadata: dto,
            }),
        );

        return updated;
    }

    async inviteMember(orgId: string, user: User, dto: InviteMemberDto): Promise<OrganizationInvitation> {
        const org = await this.findById(orgId);

        const callerMembership = await this.memberRepo.findOne({
            where: { organization: { id: orgId }, user: { id: user.id }, isActive: true },
        });

        if (!callerMembership || (callerMembership.role !== OrganizationRoleEnum.OWNER && callerMembership.role !== OrganizationRoleEnum.ADMIN)) {
            throw new ForbiddenException("Seuls les administrateurs de l'organisation peuvent envoyer des invitations.");
        }

        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        const invitation = this.invitationRepo.create({
            organization: org,
            invitedBy: user,
            phone: dto.phone,
            email: dto.email,
            role: dto.role,
            title: dto.title,
            token,
            status: InvitationStatusEnum.PENDING,
            expiresAt,
        });

        return await this.invitationRepo.save(invitation);
    }

    async acceptInvitation(token: string, user: User): Promise<OrganizationMember> {
        const invitation = await this.invitationRepo.findOne({
            where: { token },
            relations: ['organization'],
        });

        if (!invitation) {
            throw new NotFoundException('Invitation introuvable ou code invalide.');
        }

        if (invitation.status !== InvitationStatusEnum.PENDING) {
            throw new BadRequestException(`Cette invitation a déjà été traitée (${invitation.status}).`);
        }

        if (new Date() > new Date(invitation.expiresAt)) {
            invitation.status = InvitationStatusEnum.CANCELLED;
            await this.invitationRepo.save(invitation);
            throw new BadRequestException('Cette invitation a expiré.');
        }

        // Check if user is already a member
        let member = await this.memberRepo.findOne({
            where: { organization: { id: invitation.organization.id }, user: { id: user.id } },
        });

        if (member) {
            member.isActive = true;
            member.role = invitation.role;
            member.title = invitation.title ?? member.title;
        } else {
            member = this.memberRepo.create({
                organization: invitation.organization,
                user,
                role: invitation.role,
                title: invitation.title,
                isActive: true,
            });
        }

        const savedMember = await this.memberRepo.save(member);

        // Update invitation
        invitation.status = InvitationStatusEnum.ACCEPTED;
        await this.invitationRepo.save(invitation);

        // Add role ORGANIZATION_MEMBER if not present
        const hasOrgRole = await this.userRoleRepo.findOne({
            where: { user: { id: user.id }, role: UserRoleEnum.ORGANIZATION_MEMBER },
        });
        if (!hasOrgRole) {
            await this.userRoleRepo.save(
                this.userRoleRepo.create({
                    user,
                    role: UserRoleEnum.ORGANIZATION_MEMBER,
                }),
            );
        }

        return savedMember;
    }

    async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
        return await this.memberRepo.find({
            where: { organization: { id: orgId }, isActive: true },
            relations: ['user'],
        });
    }

    async removeMember(orgId: string, memberId: string, user: User): Promise<void> {
        const caller = await this.memberRepo.findOne({
            where: { organization: { id: orgId }, user: { id: user.id }, isActive: true },
        });

        if (!caller || (caller.role !== OrganizationRoleEnum.OWNER && caller.role !== OrganizationRoleEnum.ADMIN)) {
            throw new ForbiddenException('Action non autorisée');
        }

        const target = await this.memberRepo.findOne({
            where: { id: memberId, organization: { id: orgId } },
        });

        if (!target) {
            throw new NotFoundException('Membre introuvable');
        }

        if (target.role === OrganizationRoleEnum.OWNER) {
            throw new BadRequestException('Le propriétaire de l’organisation ne peut pas être retiré.');
        }

        target.isActive = false;
        await this.memberRepo.save(target);
    }

    async verifyOrganization(
        orgId: string,
        status: OrganizationVerificationStatusEnum,
        adminUser: User,
    ): Promise<Organization> {
        const org = await this.findById(orgId);
        org.verificationStatus = status;
        const saved = await this.organizationRepo.save(org);

        await this.auditLogRepo.save(
            this.auditLogRepo.create({
                actorUser: adminUser,
                action: 'ORGANIZATION_VERIFIED',
                entityType: 'Organization',
                entityId: org.id,
                metadata: { newStatus: status },
            }),
        );

        return saved;
    }
}
