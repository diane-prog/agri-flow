import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class CreatePurchaseRequestDto {
    @ApiProperty({ example: 'uuid-product', description: 'ID du produit agricole recherché' })
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @ApiProperty({ example: 50, description: 'Quantité totale recherchée (> 0)' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({ example: 'uuid-unit', description: 'ID de l\'unité de mesure (ex: tonne)' })
    @IsNotEmpty()
    @IsUUID()
    unitId: string;

    @ApiPropertyOptional({ example: 'uuid-location', description: 'Zone de collecte préférée' })
    @IsOptional()
    @IsUUID()
    locationId?: string;

    @ApiPropertyOptional({ example: 'uuid-delivery-location', description: 'Lieu de livraison souhaité' })
    @IsOptional()
    @IsUUID()
    deliveryLocationId?: string;

    @ApiPropertyOptional({ example: 140000, description: 'Budget cible unitaire en Francs CFA (XOF)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    targetPrice?: number;

    @ApiPropertyOptional({
        example: { min_purity: 98, max_humidity: 13, grade: 'A' },
        description: 'Spécifications techniques de la marchandise',
    })
    @IsOptional()
    @IsObject()
    specifications?: Record<string, any>;

    @ApiPropertyOptional({ example: 'Besoin de 50 tonnes de soja pour notre usine de Bohicon d\'ici mi-décembre.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'LIVRAISON_USINE', description: 'DEPART_CHAMP ou LIVRAISON_USINE' })
    @IsOptional()
    @IsString()
    deliveryMode?: string;

    @ApiPropertyOptional({ example: '2026-12-15T00:00:00Z', description: 'Date limite d\'approvisionnement' })
    @IsOptional()
    @IsDateString()
    requiredAt?: string;

    @ApiPropertyOptional({ example: '2026-12-10T00:00:00Z', description: 'Date d\'expiration de l\'appel d\'offres' })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @ApiPropertyOptional({ description: 'ID de l\'organisation acheteuse si applicable' })
    @IsOptional()
    @IsUUID()
    buyerOrganizationId?: string;
}
