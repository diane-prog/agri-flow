import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class TranslationInputDto {
    @ApiProperty({ example: 'fr' })
    @IsNotEmpty()
    @IsString()
    locale: string;

    @ApiProperty({ example: 'Céréales' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Graines de plantes cultivées pour leurs grains' })
    @IsOptional()
    @IsString()
    description?: string;
}

export class CreateCategoryDto {
    @ApiProperty({ example: 'cereals' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    code: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    sortOrder?: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 'uuid-parent-if-subcategory' })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional({
        example: [
            { key: 'humidity_max', label: 'Taux d\'humidité maximal (%)', type: 'number', required: true },
            { key: 'variety', label: 'Variété', type: 'string', required: false },
        ],
    })
    @IsOptional()
    @IsArray()
    attributesSchema?: any[];

    @ApiProperty({
        type: [TranslationInputDto],
        example: [
            { locale: 'fr', name: 'Céréales', description: 'Grains et céréales' },
            { locale: 'fon', name: 'Gbadoli kpo molun kpo', description: '' },
        ],
    })
    @IsArray()
    translations: TranslationInputDto[];
}
