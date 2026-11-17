import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({
        description: 'Token de rafraîchissement JWT',
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
