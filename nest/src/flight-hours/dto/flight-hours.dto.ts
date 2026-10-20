import { IsCalendarDate } from '../../common/is-calendar-date.decorator';

export class FlightHoursQueryDto {
  @IsCalendarDate()
  from: string;

  @IsCalendarDate()
  to: string;
}

export interface DailyHoursDto {
  date: string;
  hours: number;
}

export interface FlightHoursResponseDto {
  from: string;
  to: string;
  items: DailyHoursDto[];
}
