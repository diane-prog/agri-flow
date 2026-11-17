import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateListingDto {
    @ApiProperty({ example: 'uuid-product', description: 'ID du produit agricole' })
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @ApiProperty({ example: 'uuid-location', description: 'ID du lieu de stockage / collecte' })
    @IsNotEmpty()
    @IsUUID()
    locationId: string;

    @ApiProperty({ example: 10, description: 'Quantité totale disponible (> 0)' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({ example: 'uuid-unit', description: 'ID de l\'unité de mesure (ex: tonne, sac_50kg)' })
    @IsNotEmpty()
    @IsUUID()
    unitId: string;

    @ApiPropertyOptional({ example: 150000, description: 'Prix unitaire en Francs CFA (XOF)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    pricePerUnit?: number;

    @ApiPropertyOptional({ example: true, default: true, description: 'Le prix est-il négociable ?' })
    @IsOptional()
    @IsBoolean()
    priceNegotiable?: boolean;

    @ApiPropertyOptional({ example: '2026-11-20T00:00:00Z', description: 'Date de début de disponibilité' })
    @IsOptional()
    @IsDateString()
    availableFrom?: string;

    @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z', description: 'Date de fin de disponibilité' })
    @IsOptional()
    @IsDateString()
    availableUntil?: string;

    @ApiPropertyOptional({ example: 'Maïs blanc sec de Bohicon, récolte récente, bien trié sans brisures.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: ['https://s3.agriflow.bj/listings/mais-1.jpg'] })
    @IsOptional()
    @IsArray()
    photos?: string[];

    @ApiPropertyOptional({ example: 2026 })
    @IsOptional()
    @IsInt()
    harvestYear?: number;

    @ApiPropertyOptional({ example: true, default: false, description: 'Livraison prise en charge ou possible par le producteur' })
    @IsOptional()
    @IsBoolean()
    deliveryPossible?: boolean;

    @ApiPropertyOptional({
        example: { humidity: 12.5, variety: 'DMR', drying_state: 'Très sec' },
        description: 'Attributs de qualité spécifiques au produit',
    })
    @IsOptional()
    @IsObject()
    qualityData?: Record<string, any>;

    @ApiPropertyOptional({ description: 'ID de l\'organisation représentée (coopérative), si applicable' })
    @IsOptional()
    @IsUUID()
    sellerOrganizationId?: string;
}
