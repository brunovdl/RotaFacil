import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GeocodingService, GeocodeResult } from './geocoding.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('search')
  @UseGuards(AuthGuard)
  async geocode(
    @Query('street') street: string,
    @Query('number') number: string,
    @Query('city') city: string,
    @Query('state') state: string,
  ) {
    return this.geocodingService.geocode(street, number, city, state);
  }
}
