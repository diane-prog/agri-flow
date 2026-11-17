import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { TranslationInputDto } from './create-category.dto';

export class CreateProductDto {
    @ApiProperty({ example: 'maize_white' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    code: string;

    @ApiProperty({ example: 'uuid-of-category' })
    @IsNotEmpty()
    @IsString()
    categoryId: string;

    @ApiPropertyOptional({ example: 'uuid-of-measurement-unit' })
    @IsOptional()
    @IsString()
    defaultUnitId?: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        type: [TranslationInputDto],
        example: [
            { locale: 'fr', name: 'Maïs blanc', description: 'Maïs blanc sec de première qualité' },
            { locale: 'fon', name: 'Gbadoli wéwé', description: '' },
            { locale: 'en', name: 'White maize', description: 'Premium dried white maize' },
        ],
    })
    @IsArray()
    translations: TranslationInputDto[];
}
