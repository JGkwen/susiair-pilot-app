import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import {
  LegendItemDto,
  ScheduleDayDto,
  SchedulesQueryDto,
  SchedulesResponseDto,
} from './dto/schedules.dto';

const DUTY_CODES: Partial<Record<string, string>> = {
  DTY: 'DUTY',
  RLV: 'RL',
  TRD: 'TR',
  TRX: 'TX',
  ULV: 'UL',
};

function toDutyCode(dataCode: string): string {
  return DUTY_CODES[dataCode] ?? dataCode;
}

@Injectable()
export class SchedulesService {
  private readonly days: ScheduleDayDto[];
  private readonly legend: LegendItemDto[];

  constructor(data: DataService) {
    const { schedules, legend } = data.schedules;
    this.days = schedules.map((entry) => ({
      date: entry.duty_date,
      dutyType: toDutyCode(entry.duty_type),
      baseName: entry.base_name,
      baseColor: entry.base_color,
      countSchedules: entry.count_schedules,
      countLogbooks: entry.count_logbooks,
      remaining: entry.count_schedules - entry.count_logbooks,
    }));
    this.legend = legend.map(({ code, label, color }) => ({
      code: toDutyCode(code),
      label,
      color,
    }));
  }

  getMonth({ year, month }: SchedulesQueryDto): SchedulesResponseDto {
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
    return {
      year,
      month,
      days: this.days.filter((day) => day.date.startsWith(monthPrefix)),
      legend: this.legend,
    };
  }
}
