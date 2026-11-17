import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { LocationsModule } from '../locations/locations.module';
import { UsersModule } from '../users/users.module';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { PurchaseRequestsRepository } from './repositories/purchase-requests.repository';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { PurchaseRequestsService } from './purchase-requests.service';

@Module({
    imports: [
        DatabaseModule.forFeature([PurchaseRequest]),
        CatalogueModule,
        LocationsModule,
        UsersModule,
    ],
    controllers: [PurchaseRequestsController],
    providers: [PurchaseRequestsRepository, PurchaseRequestsService],
    exports: [PurchaseRequestsService, PurchaseRequestsRepository],
})
export class PurchaseRequestsModule {}
