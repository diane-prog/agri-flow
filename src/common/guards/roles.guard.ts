import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRoleEnum } from '../enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.roles) {
            throw new ForbiddenException(
                'Vous n\'avez pas les permissions nécessaires pour effectuer cette action',
            );
        }

        const activeRoles: UserRoleEnum[] = user.roles
            .filter((r: any) => r.isActive)
            .map((r: any) => r.role);

        // Super admin always has access
        if (activeRoles.includes(UserRoleEnum.SUPER_ADMIN)) {
            return true;
        }

        const hasRequiredRole = requiredRoles.some((role) =>
            activeRoles.includes(role),
        );

        if (!hasRequiredRole) {
            throw new ForbiddenException(
                'Accès refusé : rôle requis manquant pour cette ressource',
            );
        }

        return true;
    }
}
