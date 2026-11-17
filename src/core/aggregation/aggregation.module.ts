import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { RequestFulfillment } from './entities/request-fulfillment.entity';
import { RequestFulfillmentsRepository } from './repositories/request-fulfillments.repository';
import { AggregationService } from './aggregation.service';

@Module({
    imports: [DatabaseModule.forFeature([RequestFulfillment])],
    providers: [RequestFulfillmentsRepository, AggregationService],
    exports: [AggregationService, RequestFulfillmentsRepository],
})
export class AggregationModule {}
