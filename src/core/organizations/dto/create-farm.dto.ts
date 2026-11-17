import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateFarmDto {
    @ApiProperty({ example: 'Exploitation Espoir Allada', description: "Nom de l'exploitation" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID de la coopérative/organisation (si rattaché)' })
    @IsUUID()
    @IsOptional()
    organizationId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID de localisation' })
    @IsUUID()
    @IsOptional()
    locationId?: string;

    @ApiProperty({ example: 12.5, description: 'Superficie totale en hectares' })
    @IsNumber()
    @IsPositive()
    totalAreaHectares: number;

    @ApiPropertyOptional({ example: 'Terre de barre / Limoneux', description: 'Type de sol' })
    @IsString()
    @IsOptional()
    soilType?: string;

    @ApiPropertyOptional({ example: 'Forage avec système goutte-à-goutte', description: "Source d'eau" })
    @IsString()
    @IsOptional()
    waterSource?: string;

    @ApiPropertyOptional({ example: ['pineapple_sugarloaf', 'maize_white'], description: 'Codes des cultures principales' })
    @IsArray()
    @IsOptional()
    primaryCommodities?: string[];

    @ApiPropertyOptional({ example: 'Parcelle accessible aux camions 10 tonnes' })
    @IsString()
    @IsOptional()
    notes?: string;
}
