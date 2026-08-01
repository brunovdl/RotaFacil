import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { RouteStopsService } from './route-stops.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('stops')
@UseGuards(AuthGuard)
export class RouteStopsController {
  constructor(private readonly routeStopsService: RouteStopsService) {}

  @Put(':id/complete')
  complete(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('routeId') routeId: string,
  ) {
    return this.routeStopsService.complete(id, routeId, user.id);
  }

  @Put(':id/skip')
  skip(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('routeId') routeId: string,
    @Body('reason') reason?: string,
    @Body('notes') notes?: string,
    @Body('moveToEnd') moveToEnd?: boolean,
  ) {
    return this.routeStopsService.skip(id, routeId, user.id, reason, notes, moveToEnd);
  }

  @Put(':id/resume')
  resume(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('routeId') routeId: string,
  ) {
    return this.routeStopsService.resume(id, routeId, user.id);
  }

  @Get('next/:routeId')
  getNextStop(
    @CurrentUser() user: any,
    @Param('routeId') routeId: string,
  ) {
    return this.routeStopsService.getNextStop(routeId, user.id);
  }
}

