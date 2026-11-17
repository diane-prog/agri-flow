import { Check, Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { PurchaseRequestStatusEnum } from '../../../common/enum';
import { AgriculturalProduct } from '../../catalogue/entities/agricultural-product.entity';
import { MeasurementUnit } from '../../catalogue/entities/measurement-unit.entity';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';

@Entity('purchase_requests')
@Check('"quantity" > 0')
@Check('"fulfilledQuantity" >= 0 AND "fulfilledQuantity" <= "quantity"')
export class PurchaseRequest extends AbstractEntity<PurchaseRequest> {
    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    buyerUser: User;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    buyerOrganizationId?: string;

    @ManyToOne(() => AgriculturalProduct, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @Index()
    product: AgriculturalProduct;

    @ManyToOne(() => Location, { nullable: true, eager: true, onDelete: 'SET NULL' })
    location?: Location;

    @ManyToOne(() => Location, { nullable: true, eager: true, onDelete: 'SET NULL' })
    deliveryLocation?: Location;

    @Column({ type: 'numeric', precision: 20, scale: 4 })
    quantity: number;

    @Column({ type: 'numeric', precision: 20, scale: 4, default: 0 })
    fulfilledQuantity: number;

    @ManyToOne(() => MeasurementUnit, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    unit: MeasurementUnit;

    @Column({ type: 'numeric', precision: 20, scale: 2, nullable: true })
    targetPrice?: number;

    @Column({ type: 'varchar', length: 3, default: 'XOF' })
    currency: string;

    @Column({ type: 'jsonb', default: () => "'{}'" })
    specifications: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    deliveryMode?: string;

    @Column({ type: 'timestamp with time zone', nullable: true })
    requiredAt?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    expiresAt?: Date;

    @Column({
        type: 'varchar',
        length: 40,
        default: PurchaseRequestStatusEnum.OPEN,
    })
    @Index()
    status: PurchaseRequestStatusEnum;
}
