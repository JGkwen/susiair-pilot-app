import { addDays, datesBetween } from '../common/date.utils';
import { roundToOneDecimal } from '../common/number.utils';
import { DataService } from '../data/data.service';
import { FlightHoursService } from './flight-hours.service';

const data = new DataService();
const records = data.flightHours.flightHours;
const realHours = new Map(records.map(({ date, hours }) => [date, hours]));

const createService = (today: string) =>
  new FlightHoursService(data, { today });

function naiveRollingSum(end: string, windowDays: number): number {
  const start = addDays(end, 1 - windowDays);
  return roundToOneDecimal(
    records
      .filter(({ date }) => date >= start && date <= end)
      .reduce((sum, { hours }) => sum + hours, 0),
  );
}

describe('FlightHoursService', () => {
  const service = createService('2026-05-15');

  describe('calculateRollingSum', () => {
    const sampleHours = new Map([
      ['2026-01-01', 1],
      ['2026-01-02', 2],
      ['2026-01-04', 4],
    ]);

    it('sums the N days ending on each date, inclusive', () => {
      expect(
        service.calculateRollingSum(sampleHours, 2, '2026-01-01', '2026-01-02'),
      ).toEqual([
        { date: '2026-01-01', rollingSum: 1 },
        { date: '2026-01-02', rollingSum: 3 },
      ]);
    });

    it('counts a missing date inside the data as 0', () => {
      expect(
        service.calculateRollingSum(sampleHours, 3, '2026-01-03', '2026-01-04'),
      ).toEqual([
        { date: '2026-01-03', rollingSum: 3 },
        { date: '2026-01-04', rollingSum: 6 },
      ]);
    });

    it('counts days before the first record as 0', () => {
      expect(
        service.calculateRollingSum(sampleHours, 7, '2025-12-31', '2026-01-01'),
      ).toEqual([
        { date: '2025-12-31', rollingSum: 0 },
        { date: '2026-01-01', rollingSum: 1 },
      ]);
    });

    it('counts days after the last record as 0', () => {
      expect(
        service.calculateRollingSum(sampleHours, 2, '2026-01-05', '2026-01-06'),
      ).toEqual([
        { date: '2026-01-05', rollingSum: 4 },
        { date: '2026-01-06', rollingSum: 0 },
      ]);
    });

    it('returns a sum above every limit and y max unchanged', () => {
      const busyWeek = new Map(
        datesBetween('2026-01-01', '2026-01-07').map((date) => [date, 8]),
      );
      expect(
        service.calculateRollingSum(busyWeek, 7, '2026-01-07', '2026-01-07'),
      ).toEqual([{ date: '2026-01-07', rollingSum: 56 }]);
    });

    it('rounds sums to one decimal', () => {
      const decimalHours = new Map([
        ['2026-01-01', 0.1],
        ['2026-01-02', 0.2],
      ]);
      expect(
        service.calculateRollingSum(
          decimalHours,
          2,
          '2026-01-02',
          '2026-01-02',
        ),
      ).toEqual([{ date: '2026-01-02', rollingSum: 0.3 }]);
    });

    it.each([
      ['2026-05-15', 1, 6.4],
      ['2026-05-15', 7, 25.2],
      ['2026-05-15', 30, 87.2],
      ['2026-05-15', 365, 1013.8],
      ['2026-05-08', 7, 15],
      ['2026-05-08', 30, 102.2],
      ['2026-05-08', 365, 994.5],
      ['2026-05-22', 7, 36.3],
      ['2026-05-22', 30, 98.7],
      ['2026-05-22', 365, 1029],
    ])(
      'sums the real data for the window ending %s over %i days to %d',
      (date, windowDays, rollingSum) => {
        expect(
          service.calculateRollingSum(realHours, windowDays, date, date),
        ).toEqual([{ date, rollingSum }]);
      },
    );
  });

  describe('getSummary', () => {
    it('returns 15 points from 7 days before to 7 days after today', () => {
      const { asOf, points } = service.getSummary('1w');
      expect(asOf).toBe('2026-05-15');
      expect(points.map(({ date }) => date)).toEqual(
        datesBetween('2026-05-08', '2026-05-22'),
      );
      expect(points[7]).toEqual({
        date: '2026-05-15',
        rollingSum: 25.2,
        isFuture: false,
      });
      expect(
        points.filter(({ isFuture }) => isFuture).map(({ date }) => date),
      ).toEqual(datesBetween('2026-05-16', '2026-05-22'));
      expect(points.map(({ rollingSum }) => rollingSum)).toEqual([
        15, 15, 16.6, 12.6, 16.3, 22.2, 24, 25.2, 31.4, 36.4, 42.8, 44, 44.7,
        42.7, 36.3,
      ]);
    });

    it.each([
      ['1w', 7, 40, 45],
      ['1m', 30, 100, 125],
      ['3m', 90, 300, 325],
      ['6m', 180, 600, 625],
      ['1y', 365, 1050, 1200],
    ] as const)(
      'uses a %s window of %i days with limit %i and y max %i',
      (range, windowDays, limit, yMax) => {
        const summary = service.getSummary(range);
        expect(summary).toMatchObject({ range, windowDays, limit, yMax });
        expect(summary.points.map(({ rollingSum }) => rollingSum)).toEqual(
          summary.points.map(({ date }) => naiveRollingSum(date, windowDays)),
        );
      },
    );

    it('returns a point above the limit unchanged', () => {
      const { limit, points } = service.getSummary('1m');
      expect(limit).toBe(100);
      expect(points[0]).toEqual({
        date: '2026-05-08',
        rollingSum: 102.2,
        isFuture: false,
      });
    });

    it('marks future days without records as 0 and isFuture', () => {
      const { points } = createService('2026-05-31').getSummary('1w');
      expect(points[14]).toEqual({
        date: '2026-06-07',
        rollingSum: 0,
        isFuture: true,
      });
    });

    it('returns the four limit cards for the window ending today', () => {
      expect(service.getSummary('1w').cards).toEqual([
        { key: 'daily', label: 'Daily', current: 6.4, limit: 8, windowDays: 1 },
        {
          key: 'weekly',
          label: 'Weekly',
          current: 25.2,
          limit: 40,
          windowDays: 7,
        },
        {
          key: 'monthly',
          label: 'Monthly',
          current: 87.2,
          limit: 100,
          windowDays: 30,
        },
        {
          key: 'annual',
          label: 'Annual',
          current: 1013.8,
          limit: 1050,
          windowDays: 365,
        },
      ]);
    });
  });
});
