import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRoleEnum } from '../../../common/enum';

export class AddRoleDto {
    @ApiProperty({
        enum: UserRoleEnum,
        example: UserRoleEnum.PRODUCER,
        description: 'Rôle métier à ajouter pour cet utilisateur',
    })
    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;
}
