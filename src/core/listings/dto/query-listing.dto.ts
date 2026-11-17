import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ListingStatusEnum } from '../../../common/enum';

export class QueryListingDto {
    @ApiPropertyOptional({ example: 'maize_white', description: 'Code ou ID du produit' })
    @IsOptional()
    @IsString()
    product?: string;

    @ApiPropertyOptional({ example: 'cereals', description: 'Code ou ID de la catégorie' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 'Zou', description: 'Département de stockage' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({ example: 100000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({ example: 200000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({ enum: ListingStatusEnum, default: ListingStatusEnum.ACTIVE })
    @IsOptional()
    @IsEnum(ListingStatusEnum)
    status?: ListingStatusEnum;

    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20, default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}
