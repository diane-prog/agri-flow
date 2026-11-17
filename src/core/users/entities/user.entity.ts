import { Exclude } from 'class-transformer';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { VerificationLevelEnum } from '../../../common/enum';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User extends AbstractEntity<User> {
    @Index({ unique: true })
    @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
    phone: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    email?: string;

    @Exclude()
    @Column({ type: 'text', nullable: true })
    passwordHash?: string;

    @Column({ type: 'varchar', length: 120, nullable: false })
    firstName: string;

    @Column({ type: 'varchar', length: 120, nullable: false })
    lastName: string;

    @Column({ type: 'text', nullable: true })
    bio?: string;

    @Column({ type: 'varchar', length: 10, default: 'fr' })
    preferredLanguage: string;

    @Column({ type: 'varchar', length: 3, default: 'BJ' })
    country: string;

    @Column({
        type: 'smallint',
        default: VerificationLevelEnum.LEVEL_0,
    })
    verificationLevel: VerificationLevelEnum;

    @Column({ type: 'timestamp with time zone', nullable: true })
    phoneVerifiedAt?: Date;

    @Column({ type: 'varchar', length: 30, default: 'ACTIVE' })
    status: string;

    @Column({ type: 'timestamp with time zone', nullable: true })
    lastLoginAt?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    termsAcceptedAt?: Date;

    @OneToMany(() => UserRole, (userRole) => userRole.user, {
        cascade: true,
        eager: true,
    })
    roles: UserRole[];
}
