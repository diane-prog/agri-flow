import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog extends AbstractEntity<AuditLog> {
    @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @Index()
    actorUser?: User;

    @Column({ type: 'varchar', length: 100 })
    @Index()
    action: string;

    @Column({ type: 'varchar', length: 100 })
    @Index()
    entityType: string; // USER, LISTING, ORDER, DISPUTE, ORGANIZATION...

    @Column({ type: 'uuid', nullable: true })
    entityId?: string;

    @Column({ type: 'jsonb', default: () => "'{}'" })
    metadata: Record<string, any>;
}
