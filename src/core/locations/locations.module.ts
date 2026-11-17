import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { Location } from './entities/location.entity';
import { LocationsRepository } from './repositories/locations.repository';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
    imports: [DatabaseModule.forFeature([Location])],
    controllers: [LocationsController],
    providers: [LocationsRepository, LocationsService],
    exports: [LocationsService, LocationsRepository],
})
export class LocationsModule {}
