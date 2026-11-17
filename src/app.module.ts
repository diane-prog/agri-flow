import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { ResponseModule } from './common/response/response.module';
import {
    appConfig,
    authConfig,
    databaseConfig,
    redisConfig,
    mailConfig,
} from './config';
import { DatabaseModule } from './libs/database/database.module';
import { RedisModule } from './libs/redis/redis.module';
import { MailerModule } from './libs/mailer/mailer.module';
import { PasswordHashModule } from './helpers/password_hash/passwordHash.module';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { LocationsModule } from './core/locations/locations.module';
import { CatalogueModule } from './core/catalogue/catalogue.module';
import { ListingsModule } from './core/listings/listings.module';
import { PurchaseRequestsModule } from './core/purchase-requests/purchase-requests.module';
import { OffersModule } from './core/offers/offers.module';
import { OrdersModule } from './core/orders/orders.module';
import { AggregationModule } from './core/aggregation/aggregation.module';
import { DeliveriesModule } from './core/deliveries/deliveries.module';
import { ChatModule } from './core/chat/chat.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { ReviewsModule } from './core/reviews/reviews.module';
import { DisputesModule } from './core/disputes/disputes.module';
import { AdminModule } from './core/admin/admin.module';
import { OrganizationsModule } from './core/organizations/organizations.module';
import { MediaModule } from './core/media/media.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [
                appConfig,
                authConfig,
                databaseConfig,
                redisConfig,
                mailConfig,
            ],
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),
        LoggerModule,
        ResponseModule,
        RedisModule,
        MailerModule,
        DatabaseModule,
        PasswordHashModule,
        ScheduleModule.forRoot(),
        UsersModule,
        AuthModule,
        LocationsModule,
        CatalogueModule,
        ListingsModule,
        PurchaseRequestsModule,
        OffersModule,
        OrdersModule,
        AggregationModule,
        DeliveriesModule,
        ChatModule,
        NotificationsModule,
        ReviewsModule,
        DisputesModule,
        AdminModule,
        OrganizationsModule,
        MediaModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
