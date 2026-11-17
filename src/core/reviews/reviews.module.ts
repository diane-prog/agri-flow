import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { Review } from './entities/review.entity';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
    imports: [
        DatabaseModule.forFeature([Review]),
        OrdersModule,
        UsersModule,
    ],
    controllers: [ReviewsController],
    providers: [ReviewsRepository, ReviewsService],
    exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
