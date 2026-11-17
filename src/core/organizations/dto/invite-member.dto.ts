import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrganizationRoleEnum } from '../../../common/enum';

export class InviteMemberDto {
    @ApiProperty({ example: '+22997112233', description: 'Numéro de téléphone du membre invité' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional({ example: 'membre@gmail.com' })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({ enum: OrganizationRoleEnum, default: OrganizationRoleEnum.MEMBER })
    @IsEnum(OrganizationRoleEnum)
    role: OrganizationRoleEnum;

    @ApiPropertyOptional({ example: 'Responsable des Récoltes' })
    @IsString()
    @IsOptional()
    title?: string;
}
