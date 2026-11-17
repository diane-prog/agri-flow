import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/guards/jwt.strategy';
import { DatabaseModule } from '../../libs/database/database.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';

@Module({
    imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        DatabaseModule.forFeature([RefreshToken]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        OtpService,
        TokenService,
        RefreshTokensRepository,
        JwtStrategy,
    ],
    exports: [AuthService, OtpService, TokenService],
})
export class AuthModule {}
