import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('disputes')
export class Dispute extends AbstractEntity<Dispute> {
    @ManyToOne(() => Order, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    order: Order;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    openedBy: User;

    @Column({ type: 'varchar', length: 150 })
    reason: string; // Ex: Non-conformité qualité, quantité manquante, retard anormal

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'simple-array', nullable: true })
    proofUrls?: string[];

    @Column({ type: 'varchar', length: 30, default: 'OPEN' })
    @Index()
    status: string; // OPEN, UNDER_REVIEW, RESOLVED, CLOSED

    @Column({ type: 'text', nullable: true })
    resolution?: string;

    @ManyToOne(() => User, { nullable: true, eager: true })
    resolvedBy?: User;

    @Column({ type: 'timestamp with time zone', nullable: true })
    resolvedAt?: Date;
}
