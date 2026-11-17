import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'bio.dossou@agriflow.bj',
        description: 'Adresse e-mail ou numéro de téléphone (+229...)',
    })
    @IsNotEmpty({ message: 'Email ou numéro de téléphone requis' })
    @IsString()
    identity: string;

    @ApiProperty({ example: 'SecretPassword123!' })
    @IsNotEmpty({ message: 'Mot de passe requis' })
    @IsString()
    password: string;
}
