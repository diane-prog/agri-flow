import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { LocationsModule } from '../locations/locations.module';
import { UsersModule } from '../users/users.module';
import { Listing } from './entities/listing.entity';
import { ListingsRepository } from './repositories/listings.repository';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Listing]),
        CatalogueModule,
        LocationsModule,
        UsersModule,
    ],
    controllers: [ListingsController],
    providers: [ListingsRepository, ListingsService],
    exports: [ListingsService, ListingsRepository],
})
export class ListingsModule {}
