import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { OrderStatusEnum } from '../../../common/enum';
import { User } from '../../users/entities/user.entity';
import { Order } from './order.entity';

@Entity('order_status_history')
export class OrderStatusHistory extends AbstractEntity<OrderStatusHistory> {
    @ManyToOne(() => Order, { onDelete: 'CASCADE', nullable: false })
    @Index()
    order: Order;

    @Column({ type: 'varchar', length: 40, nullable: true })
    previousStatus?: OrderStatusEnum;

    @Column({ type: 'varchar', length: 40 })
    newStatus: OrderStatusEnum;

    @ManyToOne(() => User, { nullable: true, eager: true })
    actorUser?: User;

    @Column({ type: 'text', nullable: true })
    reason?: string;
}
