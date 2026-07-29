import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('operational')
  getOperational(@CurrentUser() user: any) {
    return this.reportsService.getOperational(user.id);
  }

  @Get('performance')
  getPerformance(@CurrentUser() user: any) {
    return this.reportsService.getPerformance(user.id);
  }

  @Get('km-by-day')
  getKmByDay(@CurrentUser() user: any, @Query('days') days = 30) {
    return this.reportsService.getKmByDay(user.id, +days);
  }

  @Get('deliveries-by-week')
  getDeliveriesByWeek(@CurrentUser() user: any, @Query('weeks') weeks = 12) {
    return this.reportsService.getDeliveriesByWeek(user.id, +weeks);
  }

  @Get('route-completion')
  getRouteCompletion(@CurrentUser() user: any) {
    return this.reportsService.getRouteCompletion(user.id);
  }
}
