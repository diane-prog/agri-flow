import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class UpdatePurchaseRequestDto {
    @ApiPropertyOptional({ example: 60 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @ApiPropertyOptional({ example: 142000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    targetPrice?: number;

    @ApiPropertyOptional({ example: 'uuid-delivery-location' })
    @IsOptional()
    @IsUUID()
    deliveryLocationId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    specifications?: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    requiredAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    expiresAt?: string;
}
