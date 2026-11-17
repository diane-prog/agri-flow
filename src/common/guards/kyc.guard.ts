import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KYC_LEVEL_KEY } from '../decorators/require-kyc.decorator';
import { VerificationLevelEnum } from '../enum';

@Injectable()
export class KycGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredLevel = this.reflector.getAllAndOverride<VerificationLevelEnum>(
            KYC_LEVEL_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (requiredLevel === undefined || requiredLevel === null) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('Utilisateur non authentifié');
        }

        const userLevel: VerificationLevelEnum = user.verificationLevel ?? VerificationLevelEnum.LEVEL_0;

        if (userLevel < requiredLevel) {
            throw new ForbiddenException(
                `Niveau de vérification insuffisant. Niveau requis : ${requiredLevel}, votre niveau actuel : ${userLevel}. Veuillez faire vérifier votre profil.`,
            );
        }

        return true;
    }
}
