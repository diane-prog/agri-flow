import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { Dispute } from './entities/dispute.entity';
import { DisputesRepository } from './repositories/disputes.repository';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Dispute]),
        OrdersModule,
        UsersModule,
    ],
    controllers: [DisputesController],
    providers: [DisputesRepository, DisputesService],
    exports: [DisputesService, DisputesRepository],
})
export class DisputesModule {}
