import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConfirmUploadDto {
    @ApiProperty({ example: 'agriflow/listings/harvest_photo_01' })
    @IsNotEmpty()
    @IsString()
    publicId: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/agriflow/image/upload/v1/harvest.jpg' })
    @IsNotEmpty()
    @IsString()
    url: string;

    @ApiPropertyOptional({ example: 'https://res.cloudinary.com/agriflow/image/upload/v1/harvest.jpg' })
    @IsOptional()
    @IsString()
    secureUrl?: string;

    @ApiPropertyOptional({ example: 'agriflow/listings' })
    @IsOptional()
    @IsString()
    folder?: string;

    @ApiPropertyOptional({ example: 'jpg' })
    @IsOptional()
    @IsString()
    format?: string;

    @ApiPropertyOptional({ example: 102400 })
    @IsOptional()
    @IsNumber()
    bytes?: number;

    @ApiPropertyOptional({ example: 1920 })
    @IsOptional()
    @IsNumber()
    width?: number;

    @ApiPropertyOptional({ example: 1080 })
    @IsOptional()
    @IsNumber()
    height?: number;

    @ApiPropertyOptional({ example: 'Photo du champ de maïs' })
    @IsOptional()
    @IsString()
    label?: string;
}
