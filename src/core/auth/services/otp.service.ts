import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../../../libs/mailer/mailer.service';
import { RedisService } from '../../../libs/redis/redis.service';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);
    private readonly inMemoryStore = new Map<string, { code: string; expiresAt: number }>();
    private readonly otpTtlSeconds: number;

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {
        const minutes = this.configService.get<number>('auth.otpExpirationMinutes', 10);
        this.otpTtlSeconds = minutes * 60;
    }

    /**
     * Generates a 6-digit numeric OTP code and stores it in Redis (or in-memory store).
     */
    async generateOtp(identity: string, userName?: string): Promise<string> {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const key = this.getOtpKey(identity);

        if (this.redisService.isEnabled()) {
            await this.redisService.set(key, code, this.otpTtlSeconds);
        } else {
            this.inMemoryStore.set(key, {
                code,
                expiresAt: Date.now() + this.otpTtlSeconds * 1000,
            });
        }

        // Log OTP in console for easy development & testing without SMS provider
        this.logger.log(`📱 [OTP CODE] Code OTP pour ${identity} : ${code} (valable ${this.otpTtlSeconds / 60} min)`);

        // If identity is an email, automatically send email via SMTP!
        if (identity.includes('@')) {
            try {
                await this.sendOtpEmail(identity, code, userName);
            } catch (err) {
                this.logger.error(`Erreur envoi email OTP à ${identity}: ${(err as Error).message}`);
            }
        }

        return code;
    }

    /**
     * Verifies the OTP code submitted by the user.
     */
    async verifyOtp(identity: string, code: string): Promise<boolean> {
        const key = this.getOtpKey(identity);

        if (this.redisService.isEnabled()) {
            const stored = await this.redisService.get(key);
            if (!stored || stored.trim() !== code.trim()) {
                return false;
            }
            await this.redisService.del(key);
            return true;
        }

        const item = this.inMemoryStore.get(key);
        if (!item) {
            return false;
        }

        if (Date.now() > item.expiresAt) {
            this.inMemoryStore.delete(key);
            return false;
        }

        if (item.code.trim() !== code.trim()) {
            return false;
        }

        this.inMemoryStore.delete(key);
        return true;
    }

    /**
     * Sends the OTP code to the user via email.
     */
    async sendOtpEmail(
        email: string,
        code: string,
        userName?: string,
    ): Promise<void> {
        const greeting = userName ? `Bonjour ${userName},` : 'Bonjour,';
        const html = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #16a34a; font-size: 26px; font-weight: 800; margin: 0;">🌾 AgriFlow</h1>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Plateforme B2B des Filières Agricoles du Bénin</p>
                </div>
                
                <p style="color: #1f2937; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">${greeting}</p>
                
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Voici votre code de vérification à usage unique pour vous connecter en toute sécurité à votre compte AgriFlow :
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; padding: 16px 36px;">
                        <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #16a34a; font-family: monospace;">${code}</span>
                    </div>
                </div>
                
                <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 24px;">
                    ⏳ Ce code expire dans <strong>10 minutes</strong> et ne doit être partagé avec personne.
                </p>
                
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                    Si vous n'êtes pas à l'origine de cette demande de connexion, vous pouvez ignorer cet email en toute sécurité.
                </p>
            </div>
        `;

        await this.mailerService.sendMail(
            email,
            `🌾 Votre code de vérification AgriFlow : ${code}`,
            html,
        );
    }

    private getOtpKey(target: string): string {
        return `otp:${target.toLowerCase().trim()}`;
    }
}
