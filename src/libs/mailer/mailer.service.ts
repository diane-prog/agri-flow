import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private readonly transporter: nodemailer.Transporter | null;
    private readonly from: string;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('mail.host') || process.env.MAIL_HOST;
        this.from = this.configService.get<string>('mail.from') || process.env.MAIL_FROM || 'AgriFlow <no-reply@agriflow.bj>';

        const user = this.configService.get<string>('mail.user') || process.env.MAIL_USER;
        const pass = this.configService.get<string>('mail.password') || process.env.MAIL_PASSWORD;

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port: Number(this.configService.get<number>('mail.port') || process.env.MAIL_PORT || 587),
                secure: (this.configService.get<boolean>('mail.secure') || process.env.MAIL_SECURE === 'true') || false,
                auth: {
                    user,
                    pass,
                },
            });
            this.logger.log(`📧 Service Mailer SMTP initialisé avec succès [${user}] via ${host}`);
        } else {
            this.transporter = null;
            this.logger.warn('⚠️ SMTP non configuré. Les emails seront uniquement journalisés en console.');
        }
    }

    async sendMail(
        to: string,
        subject: string,
        html: string,
    ): Promise<unknown> {
        if (!this.transporter) {
            this.logger.warn(
                `SMTP non configuré. Email pour ${to} ignoré (Sujet : ${subject}).`,
            );
            return { skipped: true };
        }

        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to,
                subject,
                html,
            });
            this.logger.log(`✅ Email envoyé avec succès à ${to} (MessageID: ${info.messageId})`);
            return info;
        } catch (error) {
            this.logger.error(`❌ Échec de l'envoi de l'email à ${to}: ${(error as Error).message}`);
            throw error;
        }
    }
}
