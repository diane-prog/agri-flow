import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { UserRoleEnum } from '../../../common/enum';
import { User } from './user.entity';

@Entity('user_roles')
@Unique(['user', 'role'])
export class UserRole extends AbstractEntity<UserRole> {
    @ManyToOne(() => User, (user) => user.roles, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    user: User;

    @Column({
        type: 'varchar',
        length: 40,
    })
    @Index()
    role: UserRoleEnum;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
