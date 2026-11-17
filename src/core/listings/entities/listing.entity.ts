import { Check, Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { ListingStatusEnum } from '../../../common/enum';
import { AgriculturalProduct } from '../../catalogue/entities/agricultural-product.entity';
import { MeasurementUnit } from '../../catalogue/entities/measurement-unit.entity';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';

@Entity('listings')
@Check('"quantity" > 0')
@Check('"reservedQuantity" >= 0 AND "reservedQuantity" <= "quantity"')
export class Listing extends AbstractEntity<Listing> {
    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    sellerUser: User;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    sellerOrganizationId?: string;

    @ManyToOne(() => AgriculturalProduct, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @Index()
    product: AgriculturalProduct;

    @ManyToOne(() => Location, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @Index()
    location: Location;

    @Column({ type: 'numeric', precision: 20, scale: 4 })
    quantity: number;

    @Column({ type: 'numeric', precision: 20, scale: 4, default: 0 })
    reservedQuantity: number;

    @ManyToOne(() => MeasurementUnit, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    unit: MeasurementUnit;

    @Column({ type: 'numeric', precision: 20, scale: 2, nullable: true })
    pricePerUnit?: number;

    @Column({ type: 'varchar', length: 3, default: 'XOF' })
    currency: string;

    @Column({ type: 'boolean', default: true })
    priceNegotiable: boolean;

    @Column({ type: 'timestamp with time zone', nullable: true })
    availableFrom?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    availableUntil?: Date;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'simple-array', nullable: true })
    photos?: string[];

    @Column({ type: 'int', nullable: true })
    harvestYear?: number;

    @Column({ type: 'boolean', default: false })
    deliveryPossible: boolean;

    /**
     * Attributs de qualité spécifiques au produit (humidité, calibrage, variété...)
     */
    @Column({ type: 'jsonb', default: () => "'{}'" })
    qualityData: Record<string, any>;

    @Column({
        type: 'varchar',
        length: 40,
        default: ListingStatusEnum.DRAFT,
    })
    @Index()
    status: ListingStatusEnum;
}
