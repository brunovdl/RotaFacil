import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { RouteStopsService } from './route-stops.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('stops')
@UseGuards(AuthGuard)
export class RouteStopsController {
  constructor(private readonly routeStopsService: RouteStopsService) {}

  @Put(':id/complete')
  complete(@Param('id') id: string, @Body('routeId') routeId: string) {
    return this.routeStopsService.complete(id, routeId);
  }

  @Get('next/:routeId')
  getNextStop(@Param('routeId') routeId: string) {
    return this.routeStopsService.getNextStop(routeId);
  }
}
