import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class StartConversationDto {
    @ApiProperty({ example: 'uuid-recipient', description: 'ID de l\'autre participant' })
    @IsNotEmpty()
    @IsUUID()
    recipientUserId: string;

    @ApiPropertyOptional({ example: 'uuid-listing' })
    @IsOptional()
    @IsUUID()
    listingId?: string;

    @ApiPropertyOptional({ example: 'uuid-purchase-request' })
    @IsOptional()
    @IsUUID()
    purchaseRequestId?: string;

    @ApiPropertyOptional({ example: 'uuid-offer' })
    @IsOptional()
    @IsUUID()
    offerId?: string;

    @ApiPropertyOptional({ example: 'uuid-order' })
    @IsOptional()
    @IsUUID()
    orderId?: string;

    @ApiProperty({ example: 'Bonjour, vos 10 tonnes de maïs sont-elles toujours disponibles ?' })
    @IsNotEmpty()
    @IsString()
    initialMessage: string;
}

export class SendMessageDto {
    @ApiProperty({ example: 'Oui absolument, nous pouvons charger dès jeudi.' })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiPropertyOptional({ example: ['https://s3.agriflow.bj/chat/photo1.jpg'] })
    @IsOptional()
    @IsArray()
    attachments?: string[];
}
