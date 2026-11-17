import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Order } from '../../orders/entities/order.entity';
import { PurchaseRequest } from '../../purchase-requests/entities/purchase-request.entity';

@Entity('request_fulfillments')
export class RequestFulfillment extends AbstractEntity<RequestFulfillment> {
    @ManyToOne(() => PurchaseRequest, { nullable: false, onDelete: 'CASCADE' })
    @Index()
    purchaseRequest: PurchaseRequest;

    @ManyToOne(() => Offer, { nullable: false, onDelete: 'RESTRICT' })
    @Index({ unique: true })
    offer: Offer;

    @ManyToOne(() => Order, { nullable: false, onDelete: 'RESTRICT' })
    @Index({ unique: true })
    order: Order;

    @Column({ type: 'numeric', precision: 20, scale: 4 })
    quantity: number;
}
