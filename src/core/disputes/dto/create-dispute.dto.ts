import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDisputeDto {
    @ApiProperty({ example: 'uuid-order', description: 'ID de la commande contestée' })
    @IsNotEmpty()
    @IsUUID()
    orderId: string;

    @ApiProperty({ example: 'Qualité non conforme aux spécifications' })
    @IsNotEmpty()
    @IsString()
    reason: string;

    @ApiProperty({ example: 'Le maïs livré a un taux d\'humidité de 18% au lieu des 13% convenus.' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiPropertyOptional({ example: ['https://s3.agriflow.bj/disputes/analyse-humidite.pdf'] })
    @IsOptional()
    @IsArray()
    proofUrls?: string[];
}

export class ResolveDisputeDto {
    @ApiProperty({ example: 'Accord trouvé : réfaction de 10% sur le prix total et acceptation du lot.' })
    @IsNotEmpty()
    @IsString()
    resolution: string;
}
