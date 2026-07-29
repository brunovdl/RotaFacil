import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  vehicle_type?: string;

  @IsOptional()
  @IsNumber()
  odometer_km?: number;

  @IsOptional()
  @IsString()
  fuel_type?: string;

  @IsOptional()
  @IsNumber()
  km_per_liter?: number;

  @IsOptional()
  @IsNumber()
  fuel_price_per_liter?: number;

  @IsOptional()
  @IsNumber()
  oil_last_change_km?: number;

  @IsOptional()
  @IsNumber()
  oil_change_interval_km?: number;

  @IsOptional()
  @IsString()
  oil_type?: string;

  @IsOptional()
  @IsNumber()
  tire_last_change_km?: number;

  @IsOptional()
  @IsNumber()
  tire_change_interval_km?: number;
}
