import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoutesModule } from './routes/routes.module';
import { RouteStopsModule } from './route-stops/route-stops.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ReportsModule } from './reports/reports.module';
import { CepModule } from './cep/cep.module';
import { GeocodingModule } from './geocoding/geocoding.module';
import { OptimizationModule } from './optimization/optimization.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    AuthModule,
    UsersModule,
    RoutesModule,
    RouteStopsModule,
    SubscriptionsModule,
    ReportsModule,
    CepModule,
    GeocodingModule,
    OptimizationModule,
    VehiclesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

