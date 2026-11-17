import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import { SendMessageDto, StartConversationDto } from './dto/send-message.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationsRepository } from './repositories/conversations.repository';
import { MessagesRepository } from './repositories/messages.repository';

@Injectable()
export class ChatService {
    constructor(
        private readonly conversationsRepo: ConversationsRepository,
        private readonly messagesRepo: MessagesRepository,
        private readonly usersRepo: UsersRepository,
    ) {}

    /**
     * Démarre une conversation ou renvoie la conversation existante entre deux utilisateurs.
     */
    async startConversation(
        senderId: string,
        dto: StartConversationDto,
    ): Promise<{ conversation: Conversation; message: Message }> {
        const sender = await this.usersRepo.findById(senderId);
        if (!sender) throw new NotFoundException('Expéditeur introuvable');

        const recipient = await this.usersRepo.findById(dto.recipientUserId);
        if (!recipient) throw new NotFoundException('Destinataire introuvable');

        if (senderId === dto.recipientUserId) {
            throw new ForbiddenException('Impossible d\'ouvrir une conversation avec soi-même');
        }

        // Vérifier si une conversation existe déjà pour ce contexte précis
        let conversation = await this.conversationsRepo
            .getRepository()
            .createQueryBuilder('conv')
            .leftJoinAndSelect('conv.participant1', 'p1')
            .leftJoinAndSelect('conv.participant2', 'p2')
            .where('conv.deleted = false')
            .andWhere(
                '((p1.id = :s AND p2.id = :r) OR (p1.id = :r AND p2.id = :s))',
                { s: senderId, r: dto.recipientUserId },
            )
            .andWhere(
                dto.orderId
                    ? 'conv.orderId = :orderId'
                    : dto.offerId
                    ? 'conv.offerId = :offerId'
                    : dto.listingId
                    ? 'conv.listingId = :listingId'
                    : '1=1',
                {
                    orderId: dto.orderId,
                    offerId: dto.offerId,
                    listingId: dto.listingId,
                },
            )
            .getOne();

        if (!conversation) {
            conversation = new Conversation({
                participant1: sender,
                participant2: recipient,
                listingId: dto.listingId,
                purchaseRequestId: dto.purchaseRequestId,
                offerId: dto.offerId,
                orderId: dto.orderId,
                lastMessageAt: new Date(),
            });
            conversation = await this.conversationsRepo.create(conversation);
        }

        const message = new Message({
            conversation,
            sender,
            content: dto.initialMessage,
            isRead: false,
        });
        const savedMessage = await this.messagesRepo.create(message);

        conversation.lastMessageAt = new Date();
        await this.conversationsRepo.save(conversation);

        return { conversation, message: savedMessage };
    }

    /**
     * Envoie un message dans une conversation existante.
     */
    async sendMessage(
        conversationId: string,
        senderId: string,
        dto: SendMessageDto,
    ): Promise<Message> {
        const conversation = await this.conversationsRepo.findById(conversationId, [
            'participant1',
            'participant2',
        ]);
        if (!conversation) throw new NotFoundException('Conversation introuvable');

        this.checkParticipant(conversation, senderId);

        const sender = await this.usersRepo.findById(senderId);

        const message = new Message({
            conversation,
            sender: sender!,
            content: dto.content,
            attachments: dto.attachments ?? [],
            isRead: false,
        });
        const savedMessage = await this.messagesRepo.create(message);

        conversation.lastMessageAt = new Date();
        await this.conversationsRepo.save(conversation);

        return savedMessage;
    }

    /**
     * Liste les conversations auxquelles l'utilisateur participe.
     */
    async getMyConversations(userId: string): Promise<Conversation[]> {
        return await this.conversationsRepo
            .getRepository()
            .createQueryBuilder('conv')
            .leftJoinAndSelect('conv.participant1', 'p1')
            .leftJoinAndSelect('conv.participant2', 'p2')
            .where('conv.deleted = false')
            .andWhere('(p1.id = :userId OR p2.id = :userId)', { userId })
            .orderBy('conv.lastMessageAt', 'DESC')
            .getMany();
    }

    /**
     * Récupère les messages d'une conversation (avec vérification stricte de confidentialité).
     */
    async getMessages(conversationId: string, userId: string): Promise<Message[]> {
        const conversation = await this.conversationsRepo.findById(conversationId, [
            'participant1',
            'participant2',
        ]);
        if (!conversation) throw new NotFoundException('Conversation introuvable');

        this.checkParticipant(conversation, userId);

        // Marquer les messages reçus comme lus
        await this.messagesRepo
            .getRepository()
            .createQueryBuilder()
            .update(Message)
            .set({ isRead: true })
            .where('conversationId = :cid AND senderId != :uid AND isRead = false', {
                cid: conversationId,
                uid: userId,
            })
            .execute();

        return await this.messagesRepo.find({
            where: { conversation: { id: conversationId } as any, deleted: false },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
    }

    private checkParticipant(conversation: Conversation, userId: string) {
        if (
            conversation.participant1?.id !== userId &&
            conversation.participant2?.id !== userId
        ) {
            throw new ForbiddenException(
                'Accès refusé : vous ne participez pas à cette conversation privée.',
            );
        }
    }
}
