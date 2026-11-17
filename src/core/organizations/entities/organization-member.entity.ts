import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { OrganizationRoleEnum } from '../../../common/enum';
import { User } from '../../users/entities/user.entity';
import { Organization } from './organization.entity';

@Entity('organization_members')
@Unique(['organization', 'user'])
export class OrganizationMember extends AbstractEntity<OrganizationMember> {
    @ManyToOne(() => Organization, (org) => org.members, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @Index()
    organization: Organization;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    user: User;

    @Column({
        type: 'varchar',
        length: 30,
        default: OrganizationRoleEnum.MEMBER,
    })
    role: OrganizationRoleEnum;

    @Column({ type: 'varchar', length: 100, nullable: true })
    title?: string; // e.g. "Responsable Commercial", "Directeur Technique"

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
