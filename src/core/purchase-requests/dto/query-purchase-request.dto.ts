import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PurchaseRequestStatusEnum } from '../../../common/enum';

export class QueryPurchaseRequestDto {
    @ApiPropertyOptional({ example: 'soybean', description: 'Code ou ID du produit recherché' })
    @IsOptional()
    @IsString()
    product?: string;

    @ApiPropertyOptional({ example: 'legumes', description: 'Catégorie de produit' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 'Zou', description: 'Département de livraison' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({ enum: PurchaseRequestStatusEnum, default: PurchaseRequestStatusEnum.OPEN })
    @IsOptional()
    @IsEnum(PurchaseRequestStatusEnum)
    status?: PurchaseRequestStatusEnum;

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
