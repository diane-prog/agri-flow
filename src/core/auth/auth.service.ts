import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UserRoleEnum, VerificationLevelEnum } from '../../common/enum';
import { PasswordHashService } from '../../helpers/password_hash/passwordHash.service';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly passwordHashService: PasswordHashService,
        private readonly otpService: OtpService,
        private readonly tokenService: TokenService,
    ) {}

    /**
     * Inscription d'un nouvel utilisateur (Kulina pattern).
     */
    async register(
        dto: RegisterDto,
    ) {
        const existingPhone = await this.usersRepository.findOne({
            where: { phone: dto.phone, deleted: false },
        });

        if (existingPhone) {
            throw new ConflictException(
                'Un compte existe déjà avec ce numéro de téléphone',
            );
        }

        if (dto.email) {
            const existingEmail = await this.usersRepository.findOne({
                where: { email: dto.email.toLowerCase(), deleted: false },
            });
            if (existingEmail) {
                throw new ConflictException(
                    'Un compte existe déjà avec cette adresse email',
                );
            }
        }

        let passwordHash: string | undefined;
        if (dto.password) {
            passwordHash = await this.passwordHashService.hashPassword(
                dto.password,
            );
        }

        // Configuration des rôles initiaux (cumulatifs)
        const requestedRoles = dto.roles && dto.roles.length > 0
            ? dto.roles
            : [UserRoleEnum.USER];

        // S'assurer que le rôle de base USER est présent
        if (!requestedRoles.includes(UserRoleEnum.USER)) {
            requestedRoles.push(UserRoleEnum.USER);
        }

        const newUser = new User({
            phone: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email ? dto.email.toLowerCase() : undefined,
            passwordHash,
            preferredLanguage: dto.preferredLanguage ?? 'fr',
            country: 'BJ',
            verificationLevel: VerificationLevelEnum.LEVEL_0,
            status: 'ACTIVE',
            termsAcceptedAt: new Date(),
        });

        newUser.roles = requestedRoles.map(
            (role) => new UserRole({ role, isActive: true }),
        );

        const savedUser = await this.usersRepository.create(newUser);

        return {
            message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.',
            user: {
                id: savedUser.id,
                phone: savedUser.phone,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                verificationLevel: savedUser.verificationLevel,
                roles: requestedRoles,
            },
        };
    }

    /**
     * Connexion par mot de passe et émission d'un code OTP (Kulina pattern).
     */
    async login(
        dto: LoginDto,
    ) {
        const identity = (dto.identity || (dto as any).identifier || '').trim();
        if (!identity) {
            throw new BadRequestException('Email ou numéro de téléphone requis');
        }

        const isEmail = identity.includes('@');
        const user = await this.usersRepository.findOne({
            where: isEmail
                ? { email: identity.toLowerCase(), deleted: false }
                : { phone: identity, deleted: false },
            relations: ['roles'],
        });

        if (!user) {
            throw new UnauthorizedException('Identifiants incorrects');
        }

        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Ce compte est désactivé ou suspendu');
        }

        if (!user.passwordHash) {
            throw new BadRequestException(
                'Aucun mot de passe configuré pour ce compte.',
            );
        }

        if (!dto.password) {
            throw new BadRequestException('Mot de passe requis');
        }

        const isMatch = await this.passwordHashService.comparePassword(
            dto.password,
            user.passwordHash,
        );

        if (!isMatch) {
            throw new UnauthorizedException('Identifiants incorrects');
        }

        // Identifiants valides: émettre le code OTP vers le téléphone ou email
        const targetIdentity = user.email || user.phone;
        const code = await this.otpService.generateOtp(targetIdentity, user.firstName);
        if (user.email && targetIdentity !== user.email) {
            await this.otpService.sendOtpEmail(user.email, code, user.firstName);
        }

        return {
            requireOtp: true,
            identity: targetIdentity,
            message: 'Identifiants valides. Un code de vérification à 6 chiffres a été envoyé.',
        };
    }

    /**
     * Renvoyer un code OTP (Kulina pattern).
     */
    async resendOtp(dto: OtpRequestDto): Promise<{ message: string }> {
        const identity = (dto.identity || (dto as any).phone || '').trim();
        if (!identity) {
            throw new BadRequestException('Email ou numéro de téléphone requis');
        }

        const isEmail = identity.includes('@');
        const user = await this.usersRepository.findOne({
            where: isEmail
                ? { email: identity.toLowerCase(), deleted: false }
                : { phone: identity, deleted: false },
        });

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        const target = user.email || user.phone;
        const code = await this.otpService.generateOtp(target, user.firstName);
        if (user.email && target !== user.email) {
            await this.otpService.sendOtpEmail(user.email, code, user.firstName);
        }
        return {
            message: `Un nouveau code de vérification a été envoyé pour ${target}`,
        };
    }

    /**
     * Vérification de l'OTP et émission des tokens d'accès (Kulina pattern).
     */
    async verifyOtp(
        dto: OtpVerifyDto,
        userAgent?: string,
        ipAddress?: string,
    ) {
        const identity = (dto.identity || (dto as any).phone || '').trim();
        if (!identity) {
            throw new BadRequestException('Email ou numéro de téléphone requis');
        }

        const isValid = await this.otpService.verifyOtp(identity, dto.code);

        if (!isValid) {
            throw new UnauthorizedException('Code de vérification invalide ou expiré');
        }

        const isEmail = identity.includes('@');
        let user = await this.usersRepository.findOne({
            where: isEmail
                ? { email: identity.toLowerCase(), deleted: false }
                : { phone: identity, deleted: false },
            relations: ['roles'],
        });

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        // Marquer vérifié et élever au Niveau 1 KYC
        user.phoneVerifiedAt = user.phoneVerifiedAt ?? new Date();
        user.lastLoginAt = new Date();
        if (user.verificationLevel === VerificationLevelEnum.LEVEL_0) {
            user.verificationLevel = VerificationLevelEnum.LEVEL_1;
        }
        await this.usersRepository.save(user);

        return await this.tokenService.issueTokens(
            user,
            userAgent,
            ipAddress,
        );
    }

    /**
     * Renouvellement de token JWT.
     */
    async refresh(
        dto: RefreshTokenDto,
        userAgent?: string,
        ipAddress?: string,
    ) {
        return await this.tokenService.rotateTokens(
            dto,
            async (id: string) => {
                return await this.usersRepository.findOne({
                    where: { id, deleted: false },
                    relations: ['roles'],
                });
            },
            userAgent,
            ipAddress,
        );
    }

    /**
     * Déconnexion (révocation de session).
     */
    async logout(dto: RefreshTokenDto) {
        await this.tokenService.revokeToken(dto);
        return { message: 'Déconnexion réussie' };
    }
}
