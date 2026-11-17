import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateLocationDto {
    @ApiProperty({ example: 'Marché Dantokpa, Cotonou' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    name: string;

    @ApiPropertyOptional({ example: 'BJ', default: 'BJ' })
    @IsOptional()
    @IsString()
    @MaxLength(3)
    country?: string;

    @ApiPropertyOptional({ example: 'Littoral' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    department?: string;

    @ApiPropertyOptional({ example: 'Cotonou' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    commune?: string;

    @ApiPropertyOptional({ example: 'Dantokpa' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    arrondissement?: string;

    @ApiPropertyOptional({ example: 'Zone commerciale Dantokpa' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: 6.3654 })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: 2.4286 })
    @IsOptional()
    @IsNumber()
    longitude?: number;
}
