import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message extends AbstractEntity<Message> {
    @ManyToOne(() => Conversation, (conv) => conv.messages, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @Index()
    conversation: Conversation;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    sender: User;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'simple-array', nullable: true })
    attachments?: string[];

    @Column({ type: 'boolean', default: false })
    isRead: boolean;
}
