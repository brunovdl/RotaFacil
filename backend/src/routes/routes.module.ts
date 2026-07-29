import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { OptimizationModule } from '../optimization/optimization.module';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [OptimizationModule, VehiclesModule],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
