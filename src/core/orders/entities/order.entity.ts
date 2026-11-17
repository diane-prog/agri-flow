import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { OrderStatusEnum, TransactionModeEnum } from '../../../common/enum';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order extends AbstractEntity<Order> {
    @Column({ type: 'varchar', length: 40, unique: true })
    @Index({ unique: true })
    reference: string; // Ex: AGR-2026-XXXX

    @ManyToOne(() => Offer, { nullable: false, eager: true })
    @Index({ unique: true })
    offer: Offer;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @Index()
    buyerUser: User;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @Index()
    sellerUser: User;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    sellerOrganizationId?: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: TransactionModeEnum.DIRECT,
    })
    transactionMode: TransactionModeEnum;

    @Column({ type: 'numeric', precision: 20, scale: 2 })
    subtotal: number; // quantity * unitPrice

    @Column({ type: 'varchar', length: 3, default: 'XOF' })
    currency: string;

    @Column({
        type: 'varchar',
        length: 40,
        default: OrderStatusEnum.PENDING_CONFIRMATION,
    })
    @Index()
    status: OrderStatusEnum;

    @Column({ type: 'timestamp with time zone', nullable: true })
    confirmedAt?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    completedAt?: Date;
}
