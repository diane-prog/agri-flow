import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number.parseInt(process.env.MAIL_PORT ?? '587', 10),
    secure: (process.env.MAIL_SECURE ?? 'false') === 'true',
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM || 'AgriFlow <no-reply@agriflow.bj>',
}));
