import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { ListingsModule } from '../listings/listings.module';
import { OrdersModule } from '../orders/orders.module';
import { PurchaseRequestsModule } from '../purchase-requests/purchase-requests.module';
import { UsersModule } from '../users/users.module';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [
        DatabaseModule.forFeature([AuditLog]),
        UsersModule,
        ListingsModule,
        OrdersModule,
        PurchaseRequestsModule,
    ],
    controllers: [AdminController],
    providers: [AuditLogsRepository, AdminService],
    exports: [AdminService, AuditLogsRepository],
})
export class AdminModule {}
