import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesQueryDto } from './dto/schedules.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  month(@Query() query: SchedulesQueryDto) {
    return this.schedules.getMonth(query);
  }
}
