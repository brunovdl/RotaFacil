import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
@UseGuards(AuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  getVehicle(@CurrentUser() user: any) {
    return this.vehiclesService.findByUserId(user.id);
  }

  @Put()
  updateVehicle(@CurrentUser() user: any, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(user.id, dto);
  }

  @Post('oil-change')
  registerOilChange(
    @CurrentUser() user: any,
    @Body('odometer_km') odometer_km?: number,
  ) {
    return this.vehiclesService.registerOilChange(user.id, odometer_km);
  }

  @Post('tire-change')
  registerTireChange(
    @CurrentUser() user: any,
    @Body('odometer_km') odometer_km?: number,
  ) {
    return this.vehiclesService.registerTireChange(user.id, odometer_km);
  }
}
