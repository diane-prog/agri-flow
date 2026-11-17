import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';
import { UserRoleEnum } from '../../../common/enum';

export class RegisterDto {
    @ApiProperty({
        example: '+22997000000',
        description: 'Numéro de téléphone avec indicatif pays (+229 pour le Bénin)',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Le numéro de téléphone doit être au format international (ex: +22997000000)',
    })
    phone: string;

    @ApiProperty({ example: 'Sègla' })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Dossou' })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiPropertyOptional({ example: 'segla.dossou@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'Secret1234!' })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ example: 'fr', default: 'fr' })
    @IsOptional()
    @IsString()
    preferredLanguage?: string;

    @ApiPropertyOptional({
        enum: UserRoleEnum,
        isArray: true,
        example: [UserRoleEnum.PRODUCER],
        description: 'Rôles initiaux souhaités (ex: PRODUCER, BUYER)',
    })
    @IsOptional()
    @IsArray()
    @IsEnum(UserRoleEnum, { each: true })
    roles?: UserRoleEnum[];
}
