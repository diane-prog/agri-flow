import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserRoleEnum } from '../../common/enum';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userRolesRepository: UserRolesRepository,
    ) {}

    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findById(id, ['roles']);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByPhone(phone: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { phone, deleted: false },
            relations: ['roles'],
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { email, deleted: false },
            relations: ['roles'],
        });
    }

    async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
        const user = await this.findById(userId);

        if (dto.email && dto.email !== user.email) {
            const existing = await this.findByEmail(dto.email);
            if (existing && existing.id !== userId) {
                throw new ConflictException('This email is already in use');
            }
            user.email = dto.email;
        }

        if (dto.firstName) user.firstName = dto.firstName;
        if (dto.lastName) user.lastName = dto.lastName;
        if (dto.preferredLanguage) user.preferredLanguage = dto.preferredLanguage;
        if (dto.bio !== undefined) user.bio = dto.bio;

        return await this.usersRepository.save(user);
    }

    async addRole(userId: string, role: UserRoleEnum): Promise<User> {
        const user = await this.findById(userId);

        // Check if role already exists
        const existingRole = user.roles?.find((r) => r.role === role);
        if (existingRole) {
            if (!existingRole.isActive) {
                existingRole.isActive = true;
                await this.userRolesRepository.save(existingRole);
            }
            return await this.findById(userId);
        }

        const newRole = new UserRole({
            user,
            role,
            isActive: true,
        });

        await this.userRolesRepository.create(newRole);
        return await this.findById(userId);
    }

    async removeRole(userId: string, role: UserRoleEnum): Promise<User> {
        const user = await this.findById(userId);

        const targetRole = user.roles?.find((r) => r.role === role);
        if (!targetRole) {
            throw new BadRequestException(`Role ${role} is not assigned to this user`);
        }

        // Prevent removing basic USER role if it's the only one
        const activeRoles = user.roles.filter((r) => r.isActive);
        if (activeRoles.length <= 1) {
            throw new BadRequestException('A user must retain at least one active role');
        }

        targetRole.isActive = false;
        await this.userRolesRepository.save(targetRole);

        return await this.findById(userId);
    }

    async getUserRoles(userId: string): Promise<UserRoleEnum[]> {
        const user = await this.findById(userId);
        return user.roles.filter((r) => r.isActive).map((r) => r.role);
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { deleted: false },
            relations: ['roles'],
            order: { createdAt: 'DESC' },
        });
    }

    async deleteMe(userId: string): Promise<{ message: string }> {
        const user = await this.findById(userId);

        user.deleted = true;
        user.deletedAt = new Date();
        user.status = 'DEACTIVATED';

        if (user.roles) {
            for (const r of user.roles) {
                r.isActive = false;
                await this.userRolesRepository.save(r);
            }
        }

        await this.usersRepository.save(user);
        return { message: 'Votre compte a été supprimé et désactivé avec succès.' };
    }

    async deleteUserByAdmin(targetId: string, adminUserId: string): Promise<{ message: string }> {
        if (targetId === adminUserId) {
            throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte administrateur via cette route.');
        }

        const target = await this.findById(targetId);

        target.deleted = true;
        target.deletedAt = new Date();
        target.status = 'DELETED';

        if (target.roles) {
            for (const r of target.roles) {
                r.isActive = false;
                await this.userRolesRepository.save(r);
            }
        }

        await this.usersRepository.save(target);
        return { message: `Utilisateur [${targetId}] supprimé avec succès par l'administrateur.` };
    }
}
