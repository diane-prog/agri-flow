import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'Koffi' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    firstName?: string;

    @ApiPropertyOptional({ example: 'Mensah' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    lastName?: string;

    @ApiPropertyOptional({ example: 'Producteur bio professionnel basé à Allada' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({ example: 'koffi.mensah@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'fr' })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    preferredLanguage?: string;
}
