import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CatalogueQueryDto {
    @ApiPropertyOptional({ example: 'cereals', description: 'Code ou ID de catégorie' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 'maïs', description: 'Terme de recherche dans le nom du produit' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 'fr', default: 'fr', description: 'Langue demandée (fr, fon, yo, en)' })
    @IsOptional()
    @IsString()
    locale?: string;
}
