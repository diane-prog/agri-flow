import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateUnitDto {
    @ApiProperty({ example: 'tonne' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    code: string;

    @ApiProperty({ example: 'Tonne métrique' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    name: string;

    @ApiPropertyOptional({ example: 'WEIGHT', default: 'WEIGHT' })
    @IsOptional()
    @IsString()
    dimension?: string;

    @ApiPropertyOptional({ example: 1000, description: 'Facteur par rapport à l’unité de base (ex: 1000 pour la tonne en kg)' })
    @IsOptional()
    @IsNumber()
    baseFactor?: number;
}
