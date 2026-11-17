import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @ApiOperation({
        summary: 'Inscription d\'un nouvel utilisateur (Producteur, Acheteur, etc.)',
    })
    @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
    async register(@Body() dto: RegisterDto) {
        return await this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Connexion par identifiants (Email ou Téléphone + Mot de passe) et envoi du code OTP',
    })
    @ApiResponse({
        status: 200,
        description: 'Identifiants valides, code OTP envoyé',
    })
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto);
    }

    @Public()
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Vérification du code OTP et obtention des tokens d\'accès (Kulina pattern)',
    })
    @ApiResponse({
        status: 200,
        description: 'Authentifié avec succès (accessToken, refreshToken, user)',
    })
    async verifyOtp(@Body() dto: OtpVerifyDto, @Req() req: Request) {
        return await this.authService.verifyOtp(
            dto,
            req.headers['user-agent'],
            req.ip,
        );
    }

    @Public()
    @Post('otp/verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Alias pour verify-otp' })
    async verifyOtpAlias(@Body() dto: OtpVerifyDto, @Req() req: Request) {
        return await this.authService.verifyOtp(
            dto,
            req.headers['user-agent'],
            req.ip,
        );
    }

    @Public()
    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Renvoyer un nouveau code OTP de vérification' })
    @ApiResponse({ status: 200, description: 'Code OTP renvoyé' })
    async resendOtp(@Body() dto: OtpRequestDto) {
        return await this.authService.resendOtp(dto);
    }

    @Public()
    @Post('otp/request')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Alias pour resend-otp' })
    async requestOtpAlias(@Body() dto: OtpRequestDto) {
        return await this.authService.resendOtp(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Renouvellement du token d\'accès' })
    @ApiResponse({ status: 200, description: 'Nouveaux tokens générés' })
    async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
        return await this.authService.refresh(
            dto,
            req.headers['user-agent'],
            req.ip,
        );
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Déconnexion et révocation de la session' })
    @ApiResponse({ status: 200, description: 'Session fermée' })
    async logout(@Body() dto: RefreshTokenDto) {
        return await this.authService.logout(dto);
    }
}
