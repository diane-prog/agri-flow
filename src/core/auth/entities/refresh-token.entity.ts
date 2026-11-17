import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends AbstractEntity<RefreshToken> {
    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
    @Index()
    user: User;

    @Column({ unique: true })
    @Index()
    tokenHash: string;

    @Column({ type: 'timestamp with time zone' })
    expiresAt: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    revokedAt?: Date;

    @Column({ nullable: true })
    userAgent?: string;

    @Column({ nullable: true })
    ipAddress?: string;
}
