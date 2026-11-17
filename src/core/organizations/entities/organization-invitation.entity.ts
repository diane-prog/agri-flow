import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { InvitationStatusEnum, OrganizationRoleEnum } from '../../../common/enum';
import { User } from '../../users/entities/user.entity';
import { Organization } from './organization.entity';

@Entity('organization_invitations')
export class OrganizationInvitation extends AbstractEntity<OrganizationInvitation> {
    @ManyToOne(() => Organization, { nullable: false, onDelete: 'CASCADE' })
    @Index()
    organization: Organization;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    invitedBy: User;

    @Column({ type: 'varchar', length: 30 })
    @Index()
    phone: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email?: string;

    @Column({
        type: 'varchar',
        length: 30,
        default: OrganizationRoleEnum.MEMBER,
    })
    role: OrganizationRoleEnum;

    @Column({ type: 'varchar', length: 100, nullable: true })
    title?: string;

    @Column({ type: 'varchar', length: 64, unique: true })
    @Index()
    token: string;

    @Column({
        type: 'varchar',
        length: 30,
        default: InvitationStatusEnum.PENDING,
    })
    @Index()
    status: InvitationStatusEnum;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;
}
