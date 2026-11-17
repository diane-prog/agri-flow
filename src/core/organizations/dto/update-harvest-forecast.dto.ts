import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { HarvestForecastStatusEnum } from '../../../common/enum';

export class UpdateHarvestForecastDto {
    @ApiPropertyOptional({ enum: HarvestForecastStatusEnum })
    @IsEnum(HarvestForecastStatusEnum)
    @IsOptional()
    status?: HarvestForecastStatusEnum;

    @ApiPropertyOptional({ example: 28000, description: 'Mise à jour de la quantité estimée' })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    estimatedQuantity?: number;

    @ApiPropertyOptional({ example: '2026-12-20T00:00:00Z' })
    @IsDateString()
    @IsOptional()
    expectedHarvestDate?: string;

    @ApiPropertyOptional({ example: 'Maturité légèrement avancée due aux pluies récentes' })
    @IsString()
    @IsOptional()
    notes?: string;
}
