import { Check, Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
@Check('"rating" >= 1 AND "rating" <= 5')
export class Review extends AbstractEntity<Review> {
    @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
    @Index()
    order: Order;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    reviewer: User;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    targetUser: User;

    @Column({ type: 'smallint' })
    rating: number; // 1 to 5

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @Column({ type: 'jsonb', default: () => "'{}'" })
    criteria: Record<string, number>; // quality: 5, delivery: 4, communication: 5

    @Column({ type: 'boolean', default: true })
    isPublic: boolean;
}
