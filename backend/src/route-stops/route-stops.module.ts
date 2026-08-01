import { Module } from '@nestjs/common';
import { RouteStopsService } from './route-stops.service';
import { RouteStopsController } from './route-stops.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [VehiclesModule],
  controllers: [RouteStopsController],
  providers: [RouteStopsService],
  exports: [RouteStopsService],
})
export class RouteStopsModule {}

