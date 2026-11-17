import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CounterOfferDto {
    @ApiProperty({ example: 5, description: 'Nouvelle quantité contre-proposée' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({ example: 140000, description: 'Nouveau prix unitaire contre-proposé en Francs CFA (XOF)' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional({ example: 'Je peux prendre vos 5 tonnes mais à 140.000 FCFA livraison comprise.' })
    @IsOptional()
    @IsString()
    notes?: string;
}
