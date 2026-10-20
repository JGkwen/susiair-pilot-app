import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class SchedulesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}

export interface ScheduleDayDto {
  date: string;
  dutyType: string;
  baseName: string;
  baseColor: string;
  countSchedules: number;
  countLogbooks: number;
  remaining: number;
}

export interface LegendItemDto {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesResponseDto {
  year: number;
  month: number;
  days: ScheduleDayDto[];
  legend: LegendItemDto[];
}
