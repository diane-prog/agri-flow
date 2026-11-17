import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { UsersModule } from '../users/users.module';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationsRepository } from './repositories/conversations.repository';
import { MessagesRepository } from './repositories/messages.repository';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Conversation, Message]),
        UsersModule,
    ],
    controllers: [ChatController],
    providers: [
        ConversationsRepository,
        MessagesRepository,
        ChatService,
    ],
    exports: [ChatService, ConversationsRepository, MessagesRepository],
})
export class ChatModule {}
