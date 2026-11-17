import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../../core/users/repositories/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersRepository: UsersRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('auth.jwtSecret'),
        });
    }

    async validate(payload: { id: string }) {
        const user = await this.usersRepository.findById(payload.id, ['roles']);
        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Utilisateur introuvable ou compte inactif');
        }
        return user;
    }
}
