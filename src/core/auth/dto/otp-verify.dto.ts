import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class OtpVerifyDto {
    @ApiProperty({
        example: 'bio.dossou@agriflow.bj',
        description: 'Adresse e-mail ou numéro de téléphone utilisé lors du login',
    })
    @IsNotEmpty({ message: 'Email ou numéro de téléphone requis' })
    @IsString()
    identity: string;

    @ApiProperty({
        example: '123456',
        description: 'Code de vérification à 6 chiffres reçu dans le terminal',
    })
    @IsNotEmpty({ message: 'Code OTP requis' })
    @IsString()
    @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
    code: string;
}
