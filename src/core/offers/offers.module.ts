import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { AggregationModule } from '../aggregation/aggregation.module';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { ListingsModule } from '../listings/listings.module';
import { OrdersModule } from '../orders/orders.module';
import { PurchaseRequestsModule } from '../purchase-requests/purchase-requests.module';
import { UsersModule } from '../users/users.module';
import { OfferRevision } from './entities/offer-revision.entity';
import { Offer } from './entities/offer.entity';
import { OfferRevisionsRepository } from './repositories/offer-revisions.repository';
import { OffersRepository } from './repositories/offers.repository';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Offer, OfferRevision]),
        UsersModule,
        CatalogueModule,
        ListingsModule,
        PurchaseRequestsModule,
        OrdersModule,
        AggregationModule,
    ],
    controllers: [OffersController],
    providers: [
        OffersRepository,
        OfferRevisionsRepository,
        OffersService,
    ],
    exports: [OffersService, OffersRepository],
})
export class OffersModule {}
