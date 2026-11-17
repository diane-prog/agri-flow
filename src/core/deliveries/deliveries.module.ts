import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { LocationsModule } from '../locations/locations.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { Delivery } from './entities/delivery.entity';
import { DeliveriesRepository } from './repositories/deliveries.repository';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Delivery]),
        OrdersModule,
        LocationsModule,
        UsersModule,
    ],
    controllers: [DeliveriesController],
    providers: [DeliveriesRepository, DeliveriesService],
    exports: [DeliveriesService, DeliveriesRepository],
})
export class DeliveriesModule {}
