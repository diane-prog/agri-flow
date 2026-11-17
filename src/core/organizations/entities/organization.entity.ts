import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { OrganizationTypeEnum, OrganizationVerificationStatusEnum } from '../../../common/enum';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { OrganizationMember } from './organization-member.entity';
import { Farm } from './farm.entity';

@Entity('organizations')
export class Organization extends AbstractEntity<Organization> {
    @Column({ type: 'varchar', length: 150 })
    @Index()
    name: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    legalName?: string;

    @Column({
        type: 'varchar',
        length: 50,
        default: OrganizationTypeEnum.COOPERATIVE,
    })
    @Index()
    type: OrganizationTypeEnum;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @Index()
    registrationNumber?: string; // IFU / RCCM au Bénin

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email?: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @ManyToOne(() => Location, { nullable: true, eager: true, onDelete: 'SET NULL' })
    location?: Location;

    @Column({
        type: 'varchar',
        length: 30,
        default: OrganizationVerificationStatusEnum.PENDING,
    })
    @Index()
    verificationStatus: OrganizationVerificationStatusEnum;

    @Column({ type: 'jsonb', default: () => "'[]'" })
    verificationDocuments: Array<{
        documentType: string;
        documentUrl: string;
        uploadedAt: string;
    }>;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @Index()
    creator: User;

    @OneToMany(() => OrganizationMember, (member) => member.organization)
    members: OrganizationMember[];

    @OneToMany(() => Farm, (farm) => farm.organization)
    farms: Farm[];
}
