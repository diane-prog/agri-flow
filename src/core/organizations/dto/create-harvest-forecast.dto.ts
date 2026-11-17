import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateHarvestForecastDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: "ID de l'exploitation" })
    @IsUUID()
    @IsNotEmpty()
    farmId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID du produit agricole du catalogue' })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: "ID de l'unité de mesure" })
    @IsUUID()
    @IsNotEmpty()
    unitId: string;

    @ApiProperty({ example: 4.5, description: 'Superficie cultivée pour cette récolte (hectares)' })
    @IsNumber()
    @IsPositive()
    cultivatedAreaHectares: number;

    @ApiProperty({ example: 25000, description: 'Quantité prévisionnelle estimée' })
    @IsNumber()
    @IsPositive()
    estimatedQuantity: number;

    @ApiProperty({ example: '2026-12-15T00:00:00Z', description: 'Date estimée de récolte' })
    @IsDateString()
    @IsNotEmpty()
    expectedHarvestDate: string;

    @ApiPropertyOptional({ example: '2026-08-01T00:00:00Z', description: 'Date de semis / plantation' })
    @IsDateString()
    @IsOptional()
    plantingDate?: string;

    @ApiPropertyOptional({ example: 'Variété Pain de sucre sélectionnée pour jus' })
    @IsString()
    @IsOptional()
    notes?: string;
}
