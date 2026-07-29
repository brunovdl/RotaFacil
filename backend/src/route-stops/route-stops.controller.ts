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

  @Put(':id/skip')
  skip(
    @Param('id') id: string,
    @Body('routeId') routeId: string,
    @Body('reason') reason?: string,
    @Body('notes') notes?: string,
    @Body('moveToEnd') moveToEnd?: boolean,
  ) {
    return this.routeStopsService.skip(id, routeId, reason, notes, moveToEnd);
  }

  @Put(':id/resume')
  resume(@Param('id') id: string, @Body('routeId') routeId: string) {
    return this.routeStopsService.resume(id, routeId);
  }

  @Get('next/:routeId')
  getNextStop(@Param('routeId') routeId: string) {
    return this.routeStopsService.getNextStop(routeId);
  }
}
