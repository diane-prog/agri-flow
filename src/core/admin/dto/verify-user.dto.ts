import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ListingStatusEnum, VerificationLevelEnum } from '../../../common/enum';

export class VerifyUserDto {
    @ApiProperty({
        enum: VerificationLevelEnum,
        example: VerificationLevelEnum.LEVEL_1,
        description: 'Niveau attribué (1 = Identité vérifiée, 2 = Professionnel certifié)',
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(2)
    verificationLevel: VerificationLevelEnum;

    @ApiPropertyOptional({ example: 'Documents d\'identité (CIP / CNI) vérifiés conformes.' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ModerateListingDto {
    @ApiProperty({
        enum: [ListingStatusEnum.ACTIVE, ListingStatusEnum.REJECTED, ListingStatusEnum.PAUSED],
        example: ListingStatusEnum.ACTIVE,
    })
    @IsNotEmpty()
    @IsEnum(ListingStatusEnum)
    status: ListingStatusEnum;

    @ApiPropertyOptional({ example: 'Annonce validée après vérification des photos.' })
    @IsOptional()
    @IsString()
    reason?: string;
}
