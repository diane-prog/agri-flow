import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { Offer } from './offer.entity';

@Entity('offer_revisions')
export class OfferRevision extends AbstractEntity<OfferRevision> {
    @ManyToOne(() => Offer, (offer) => offer.revisions, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @Index()
    offer: Offer;

    @Column({ type: 'int', default: 1 })
    revisionNumber: number;

    @ManyToOne(() => User, { nullable: false, eager: true })
    authorUser: User;

    @Column({ type: 'numeric', precision: 20, scale: 4 })
    quantity: number;

    @Column({ type: 'numeric', precision: 20, scale: 2 })
    unitPrice: number;

    @Column({ type: 'varchar', length: 3, default: 'XOF' })
    currency: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;
}
