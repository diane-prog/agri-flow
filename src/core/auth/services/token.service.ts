import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { User } from '../../users/entities/user.entity';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';

@Injectable()
export class TokenService {
    constructor(
        private readonly configService: ConfigService,
        private readonly refreshTokensRepository: RefreshTokensRepository,
    ) {}

    /**
     * Issues an access token and a persisted refresh token.
     */
    async issueTokens(
        user: User,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: string;
            phone: string;
            firstName: string;
            lastName: string;
            verificationLevel: number;
            roles: string[];
        };
    }> {
        const roles = user.roles ? user.roles.filter((r) => r.isActive).map((r) => r.role) : [];

        const payload = {
            id: user.id,
            phone: user.phone,
            roles,
            verificationLevel: user.verificationLevel,
        };

        const accessExpiration = this.configService.get<string>(
            'auth.jwtAccessExpirationTime',
            '7d',
        );

        const accessToken = jwt.sign(
            payload,
            this.configService.getOrThrow<string>('auth.jwtSecret'),
            { expiresIn: accessExpiration as jwt.SignOptions['expiresIn'] },
        );

        const refreshExpiration = this.configService.get<string>(
            'auth.jwtRefreshExpirationTime',
            '30d',
        );

        const refreshToken = jwt.sign(
            { id: user.id, purpose: 'refresh-token' },
            this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
            { expiresIn: refreshExpiration as jwt.SignOptions['expiresIn'] },
        );

        const decoded = jwt.decode(refreshToken) as { exp?: number };
        const expiresAt = decoded.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await this.refreshTokensRepository.create(
            new RefreshToken({
                user: { id: user.id } as User,
                tokenHash: this.hashToken(refreshToken),
                expiresAt,
                userAgent,
                ipAddress,
            }),
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: accessExpiration,
            user: {
                id: user.id,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                verificationLevel: user.verificationLevel,
                roles,
            },
        };
    }

    /**
     * Rotates a refresh token and returns a new pair.
     */
    async rotateTokens(
        dto: RefreshTokenDto,
        getUserById: (id: string) => Promise<User>,
        userAgent?: string,
        ipAddress?: string,
    ) {
        let payload: { id?: string; purpose?: string };

        try {
            payload = jwt.verify(
                dto.refreshToken,
                this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
            ) as { id?: string; purpose?: string };
        } catch {
            throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré');
        }

        if (!payload.id || payload.purpose !== 'refresh-token') {
            throw new UnauthorizedException('Type de token non valide');
        }

        const stored = await this.refreshTokensRepository.findOne({
            where: {
                tokenHash: this.hashToken(dto.refreshToken),
                revokedAt: null,
                deleted: false,
            },
        });

        if (!stored || stored.expiresAt < new Date()) {
            throw new UnauthorizedException('Session expirée ou révoquée');
        }

        // Revoke the old token
        await this.refreshTokensRepository.update(
            { id: stored.id },
            { revokedAt: new Date() },
        );

        const user = await getUserById(payload.id);
        return await this.issueTokens(user, userAgent, ipAddress);
    }

    /**
     * Revokes a refresh token (logout).
     */
    async revokeToken(dto: RefreshTokenDto): Promise<{ message: string }> {
        const stored = await this.refreshTokensRepository.findOne({
            where: {
                tokenHash: this.hashToken(dto.refreshToken),
                deleted: false,
            },
        });

        if (stored && !stored.revokedAt) {
            await this.refreshTokensRepository.update(
                { id: stored.id },
                { revokedAt: new Date() },
            );
        }

        return { message: 'Déconnexion effectuée avec succès' };
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
