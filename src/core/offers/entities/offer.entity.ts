import { Check, Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { OfferStatusEnum, TransactionModeEnum } from '../../../common/enum';
import { MeasurementUnit } from '../../catalogue/entities/measurement-unit.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { PurchaseRequest } from '../../purchase-requests/entities/purchase-request.entity';
import { User } from '../../users/entities/user.entity';
import { OfferRevision } from './offer-revision.entity';

@Entity('offers')
@Check('"quantity" > 0')
@Check('"unitPrice" >= 0')
export class Offer extends AbstractEntity<Offer> {
    @ManyToOne(() => Listing, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @Index()
    listing?: Listing;

    @ManyToOne(() => PurchaseRequest, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @Index()
    purchaseRequest?: PurchaseRequest;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    buyerUser: User;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    sellerUser: User;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    sellerOrganizationId?: string;

    @Column({ type: 'numeric', precision: 20, scale: 4 })
    quantity: number;

    @ManyToOne(() => MeasurementUnit, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    unit: MeasurementUnit;

    @Column({ type: 'numeric', precision: 20, scale: 2 })
    unitPrice: number;

    @Column({ type: 'varchar', length: 3, default: 'XOF' })
    currency: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: TransactionModeEnum.DIRECT,
    })
    transactionMode: TransactionModeEnum;

    @Column({
        type: 'varchar',
        length: 30,
        default: OfferStatusEnum.PENDING,
    })
    @Index()
    status: OfferStatusEnum;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'timestamp with time zone', nullable: true })
    expiresAt?: Date;

    @OneToMany(() => OfferRevision, (rev) => rev.offer, {
        cascade: true,
        eager: true,
    })
    revisions: OfferRevision[];
}
