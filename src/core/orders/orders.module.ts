import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { UsersModule } from '../users/users.module';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Order } from './entities/order.entity';
import { OrderStatusHistoryRepository } from './repositories/order-status-history.repository';
import { OrdersRepository } from './repositories/orders.repository';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Order, OrderStatusHistory]),
        UsersModule,
    ],
    controllers: [OrdersController],
    providers: [
        OrdersRepository,
        OrderStatusHistoryRepository,
        OrdersService,
    ],
    exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
