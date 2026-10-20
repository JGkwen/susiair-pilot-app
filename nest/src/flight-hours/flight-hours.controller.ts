import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursQueryDto } from './dto/flight-hours.dto';
import { SummaryQueryDto } from './dto/summary.dto';
import { FlightHoursService } from './flight-hours.service';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHours: FlightHoursService) {}

  @Get()
  dailyHours(@Query() query: FlightHoursQueryDto) {
    return this.flightHours.getDailyHours(query);
  }

  @Get('summary')
  summary(@Query() query: SummaryQueryDto) {
    return this.flightHours.getSummary(query.range);
  }
}
