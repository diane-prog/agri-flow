import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation extends AbstractEntity<Conversation> {
    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    participant1: User;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    participant2: User;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    listingId?: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    purchaseRequestId?: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    offerId?: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    orderId?: string;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    lastMessageAt: Date;

    @OneToMany(() => Message, (msg) => msg.conversation)
    messages: Message[];
}
