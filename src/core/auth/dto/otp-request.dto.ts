import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OtpRequestDto {
    @ApiProperty({
        example: 'bio.dossou@agriflow.bj',
        description: 'Adresse e-mail ou numéro de téléphone pour renvoyer le code OTP',
    })
    @IsNotEmpty({ message: 'Email ou numéro de téléphone requis' })
    @IsString()
    identity: string;
}
