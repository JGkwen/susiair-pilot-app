import { BadRequestException, Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock.service';
import { addDays, datesBetween, diffDays } from '../common/date.utils';
import { roundToOneDecimal } from '../common/number.utils';
import { DataService } from '../data/data.service';
import {
  FlightHoursQueryDto,
  FlightHoursResponseDto,
} from './dto/flight-hours.dto';
import {
  RollingSumPointDto,
  SummaryRange,
  SummaryResponseDto,
} from './dto/summary.dto';

const MAX_RANGE_DAYS = 400;
const DAYS_AROUND_TODAY = 7;

const RANGES: Record<
  SummaryRange,
  { windowDays: number; defaultLimit: number; defaultYMax: number }
> = {
  '1w': { windowDays: 7, defaultLimit: 40, defaultYMax: 45 },
  '1m': { windowDays: 30, defaultLimit: 100, defaultYMax: 125 },
  '3m': { windowDays: 90, defaultLimit: 300, defaultYMax: 325 },
  '6m': { windowDays: 180, defaultLimit: 600, defaultYMax: 625 },
  '1y': { windowDays: 365, defaultLimit: 1050, defaultYMax: 1200 },
};

const CARDS = [
  { key: 'daily', label: 'Daily', windowDays: 1, defaultLimit: 8 },
  { key: 'weekly', label: 'Weekly', windowDays: 7, defaultLimit: 40 },
  { key: 'monthly', label: 'Monthly', windowDays: 30, defaultLimit: 100 },
  { key: 'annual', label: 'Annual', windowDays: 365, defaultLimit: 1050 },
];

@Injectable()
export class FlightHoursService {
  private readonly hoursByDate: ReadonlyMap<string, number>;

  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {
    this.hoursByDate = new Map(
      data.flightHours.flightHours.map(({ date, hours }) => [date, hours]),
    );
  }

  getDailyHours({ from, to }: FlightHoursQueryDto): FlightHoursResponseDto {
    if (from > to) {
      throw new BadRequestException('from must be on or before to');
    }
    if (diffDays(from, to) + 1 > MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `from and to can cover at most ${MAX_RANGE_DAYS} days`,
      );
    }
    return {
      from,
      to,
      items: datesBetween(from, to).map((date) => ({
        date,
        hours: this.hoursByDate.get(date) ?? 0,
      })),
    };
  }

  getSummary(range: SummaryRange): SummaryResponseDto {
    const asOf = this.clock.today;
    const { limits, chartBounds } = this.data.flightHours;
    const { windowDays, defaultLimit, defaultYMax } = RANGES[range];
    const points = this.calculateRollingSum(
      this.hoursByDate,
      windowDays,
      addDays(asOf, -DAYS_AROUND_TODAY),
      addDays(asOf, DAYS_AROUND_TODAY),
    );

    return {
      range,
      windowDays,
      limit: chartBounds?.[range]?.limit ?? defaultLimit,
      yMax: chartBounds?.[range]?.max ?? defaultYMax,
      asOf,
      points: points.map((point) => ({
        ...point,
        isFuture: point.date > asOf,
      })),
      cards: CARDS.map((card) => ({
        key: card.key,
        label: card.label,
        current: this.calculateRollingSum(
          this.hoursByDate,
          card.windowDays,
          asOf,
          asOf,
        )[0].rollingSum,
        limit: limits?.[card.key] ?? card.defaultLimit,
        windowDays: card.windowDays,
      })),
    };
  }

  calculateRollingSum(
    hoursByDate: ReadonlyMap<string, number>,
    windowDays: number,
    from: string,
    to: string,
  ): RollingSumPointDto[] {
    const dates = datesBetween(addDays(from, 1 - windowDays), to);
    const prefixSums = [0];
    dates.forEach((date, index) =>
      prefixSums.push(prefixSums[index] + (hoursByDate.get(date) ?? 0)),
    );
    return dates.slice(windowDays - 1).map((date, index) => ({
      date,
      rollingSum: roundToOneDecimal(
        prefixSums[index + windowDays] - prefixSums[index],
      ),
    }));
  }
}
