import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ example: 'uuid-order', description: 'ID de la commande finalisée concernée' })
    @IsNotEmpty()
    @IsUUID()
    orderId: string;

    @ApiProperty({ example: 5, description: 'Note globale de 1 à 5 étoiles' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional({ example: 'Produit conforme, très bon maïs bien séché. Livraison dans les délais.' })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiPropertyOptional({
        example: { productQuality: 5, deliveryPunctuality: 4, communication: 5 },
        description: 'Détail des notes par critères spécifiques',
    })
    @IsOptional()
    @IsObject()
    criteria?: Record<string, number>;
}
