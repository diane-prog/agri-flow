import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification extends AbstractEntity<Notification> {
    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    user: User;

    @Column({ type: 'varchar', length: 200 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', length: 60, default: 'INFO' })
    @Index()
    type: string; // NEW_OFFER, COUNTER_OFFER, ORDER_CONFIRMED, DELIVERY_DISPATCHED, MESSAGE_RECEIVED...

    @Column({ type: 'jsonb', default: () => "'{}'" })
    metadata: Record<string, any>;

    @Column({ type: 'boolean', default: false })
    @Index()
    isRead: boolean;
}
