import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { DeliveryStatusEnum } from '../../../common/enum';
import { Location } from '../../locations/entities/location.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('deliveries')
export class Delivery extends AbstractEntity<Delivery> {
    @OneToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn()
    @Index({ unique: true })
    order: Order;

    @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @Index()
    transporterUser?: User;

    @Column({ type: 'varchar', length: 150, nullable: true })
    transporterName?: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    transporterPhone?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    vehicleInfo?: string; // Ex: Camion benne 10T - Immatriculation BJ 1234 RB

    @ManyToOne(() => Location, { nullable: true, eager: true })
    pickupLocation?: Location;

    @ManyToOne(() => Location, { nullable: true, eager: true })
    deliveryLocation?: Location;

    @Column({ type: 'timestamp with time zone', nullable: true })
    expectedAt?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    dispatchedAt?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    deliveredAt?: Date;

    @Column({ type: 'numeric', precision: 20, scale: 4, nullable: true })
    quantityDispatched?: number;

    @Column({ type: 'numeric', precision: 20, scale: 4, nullable: true })
    quantityReceived?: number;

    @Column({
        type: 'varchar',
        length: 40,
        default: DeliveryStatusEnum.PENDING,
    })
    @Index()
    status: DeliveryStatusEnum;

    @Column({ type: 'text', nullable: true })
    proofUrl?: string; // Photo du bordereau de livraison émargé

    @Column({ type: 'text', nullable: true })
    notes?: string;
}
