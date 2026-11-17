import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsInt,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class UpdateListingDto {
    @ApiPropertyOptional({ example: 12 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @ApiPropertyOptional({ example: 145000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    pricePerUnit?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    priceNegotiable?: boolean;

    @ApiPropertyOptional({ example: 'uuid-location' })
    @IsOptional()
    @IsUUID()
    locationId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    availableFrom?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    availableUntil?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    photos?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    harvestYear?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    deliveryPossible?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    qualityData?: Record<string, any>;
}
