import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [DatabaseModule.forFeature([User, UserRole])],
    controllers: [UsersController],
    providers: [
        UsersRepository,
        UserRolesRepository,
        UsersService,
    ],
    exports: [UsersService, UsersRepository, UserRolesRepository],
})
export class UsersModule {}
