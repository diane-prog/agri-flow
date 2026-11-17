import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrganizationTypeEnum } from '../../../common/enum';

export class CreateOrganizationDto {
    @ApiProperty({ example: 'Coopérative Maraîchère du Zou', description: "Nom de l'organisation" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'COOP-ZOU SARL', description: 'Raison sociale' })
    @IsString()
    @IsOptional()
    legalName?: string;

    @ApiProperty({ enum: OrganizationTypeEnum, example: OrganizationTypeEnum.COOPERATIVE })
    @IsEnum(OrganizationTypeEnum)
    type: OrganizationTypeEnum;

    @ApiPropertyOptional({ example: 'IFU1234567890123', description: 'Numéro IFU ou RCCM' })
    @IsString()
    @IsOptional()
    registrationNumber?: string;

    @ApiPropertyOptional({ example: 'Regroupement de 80 producteurs d’ananas et légumes à Bohicon' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'contact@coopzou.bj' })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '+22997001122' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 'Quartier Dako, Bohicon' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID de la localisation' })
    @IsUUID()
    @IsOptional()
    locationId?: string;
}
