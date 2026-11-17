import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    jwtSecret: process.env.JWT_SECRET ?? 'agriflow-super-secret-key-change-in-production',
    jwtRefreshSecret:
        process.env.JWT_REFRESH_SECRET ??
        'agriflow-super-refresh-secret-key-change-in-production',
    jwtAccessExpirationTime:
        process.env.JWT_ACCESS_EXPIRATION_TIME ?? '7d',
    jwtRefreshExpirationTime:
        process.env.JWT_REFRESH_EXPIRATION_TIME ?? '30d',
    otpExpirationMinutes: Number.parseInt(
        process.env.OTP_EXPIRATION_MINUTES ?? '10',
        10,
    ),
    roles: {
        superAdmin: 'SUPER_ADMIN',
        admin: 'ADMIN',
        platformAgent: 'PLATFORM_AGENT',
        moderator: 'MODERATOR',
        producer: 'PRODUCER',
        buyer: 'BUYER',
        transporter: 'TRANSPORTER',
        user: 'USER',
    },
}));
