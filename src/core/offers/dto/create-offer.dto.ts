import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { TransactionModeEnum } from '../../../common/enum';

export class CreateOfferDto {
    @ApiPropertyOptional({ example: 'uuid-listing', description: 'ID de l\'annonce ciblée (si offre en réponse à une annonce)' })
    @IsOptional()
    @IsUUID()
    listingId?: string;

    @ApiPropertyOptional({ example: 'uuid-purchase-request', description: 'ID de la demande ciblée (si offre en réponse à une demande)' })
    @IsOptional()
    @IsUUID()
    purchaseRequestId?: string;

    @ApiProperty({ example: 5, description: 'Quantité proposée' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({ example: 'uuid-unit', description: 'ID de l\'unité de mesure' })
    @IsNotEmpty()
    @IsUUID()
    unitId: string;

    @ApiProperty({ example: 145000, description: 'Prix unitaire proposé en Francs CFA (XOF)' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional({ example: 'XOF', default: 'XOF' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({
        enum: TransactionModeEnum,
        default: TransactionModeEnum.DIRECT,
        description: 'DIRECT ou ASSISTED (accompagné par un agent plateforme)',
    })
    @IsOptional()
    @IsEnum(TransactionModeEnum)
    transactionMode?: TransactionModeEnum;

    @ApiPropertyOptional({ example: 'Disponibilité immédiate au magasin de Bohicon.' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: '2026-12-05T00:00:00Z', description: 'Date de validité limite de l\'offre' })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @ApiPropertyOptional({ description: 'ID de l\'organisation venderesse le cas échéant' })
    @IsOptional()
    @IsUUID()
    sellerOrganizationId?: string;
}
