import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
} from 'class-validator';

export class CreateDeliveryDto {
    @ApiProperty({ example: 'uuid-order', description: 'ID de la commande associée' })
    @IsNotEmpty()
    @IsUUID()
    orderId: string;

    @ApiPropertyOptional({ example: 'uuid-transporter', description: 'ID de l\'utilisateur transporteur' })
    @IsOptional()
    @IsUUID()
    transporterUserId?: string;

    @ApiPropertyOptional({ example: 'Moussa Bio' })
    @IsOptional()
    @IsString()
    transporterName?: string;

    @ApiPropertyOptional({ example: '+22997112233' })
    @IsOptional()
    @IsString()
    transporterPhone?: string;

    @ApiPropertyOptional({ example: 'Camion benne 10 tonnes - RB 4521' })
    @IsOptional()
    @IsString()
    vehicleInfo?: string;

    @ApiPropertyOptional({ example: 'uuid-pickup-location' })
    @IsOptional()
    @IsUUID()
    pickupLocationId?: string;

    @ApiPropertyOptional({ example: 'uuid-delivery-location' })
    @IsOptional()
    @IsUUID()
    deliveryLocationId?: string;

    @ApiPropertyOptional({ example: '2026-11-25T14:00:00Z', description: 'Date prévue de livraison' })
    @IsOptional()
    @IsDateString()
    expectedAt?: string;

    @ApiPropertyOptional({ example: 'Chargement direct au magasin central' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class DispatchDeliveryDto {
    @ApiProperty({ example: 10, description: 'Quantité effectivement chargée et expédiée' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    quantityDispatched: number;

    @ApiPropertyOptional({ example: '2026-11-24T08:00:00Z' })
    @IsOptional()
    @IsDateString()
    dispatchedAt?: string;

    @ApiPropertyOptional({ example: 'https://s3.agriflow.bj/bl/bl-depart-123.jpg', description: 'Preuve de départ / pesée' })
    @IsOptional()
    @IsString()
    proofUrl?: string;
}

export class ConfirmDeliveryDto {
    @ApiProperty({ example: 10, description: 'Quantité effectivement réceptionnée et pesée à l\'arrivée' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    quantityReceived: number;

    @ApiPropertyOptional({ example: 'https://s3.agriflow.bj/bl/bl-recu-123.jpg', description: 'Photo du bordereau signé' })
    @IsOptional()
    @IsString()
    proofUrl?: string;

    @ApiPropertyOptional({ example: 'Marchandise conforme, pesée certifiée.' })
    @IsOptional()
    @IsString()
    notes?: string;
}
