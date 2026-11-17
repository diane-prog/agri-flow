import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SignUploadDto {
    @ApiPropertyOptional({ example: 'agriflow/listings', description: 'Dossier Cloudinary cible' })
    @IsOptional()
    @IsString()
    folder?: string;

    @ApiPropertyOptional({ example: 'harvest_photo_01' })
    @IsOptional()
    @IsString()
    publicId?: string;

    @ApiPropertyOptional({ example: 'image', description: 'Type de ressource (image, raw, auto)' })
    @IsOptional()
    @IsString()
    resourceType?: string;
}
