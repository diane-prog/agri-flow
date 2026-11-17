import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SendMessageDto, StartConversationDto } from './dto/send-message.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatService } from './chat.service';

@ApiTags('Chat & Messaging')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller(['conversations', 'chat/conversations'])
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get()
    @ApiOperation({ summary: 'Lister les conversations privées de l’utilisateur' })
    @ApiResponse({ status: 200, description: 'Liste des conversations' })
    async getMyConversations(
        @CurrentUser('id') userId: string,
    ): Promise<Conversation[]> {
        return await this.chatService.getMyConversations(userId);
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Obtenir l’historique des messages d’une conversation' })
    @ApiResponse({ status: 200, description: 'Messages de la conversation' })
    async getMessages(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<Message[]> {
        return await this.chatService.getMessages(id, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Démarrer une conversation liée à un contexte (Annonce, Offre, Commande)' })
    @ApiResponse({ status: 201, description: 'Conversation initialisée' })
    async startConversation(
        @CurrentUser('id') userId: string,
        @Body() dto: StartConversationDto,
    ) {
        return await this.chatService.startConversation(userId, dto);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Envoyer un message dans une conversation existante' })
    @ApiResponse({ status: 201, description: 'Message envoyé' })
    async sendMessage(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: SendMessageDto,
    ): Promise<Message> {
        return await this.chatService.sendMessage(id, userId, dto);
    }
}
