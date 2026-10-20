import { IsIn } from 'class-validator';

const SUMMARY_RANGES = ['1w', '1m', '3m', '6m', '1y'] as const;

export type SummaryRange = (typeof SUMMARY_RANGES)[number];

export class SummaryQueryDto {
  @IsIn(SUMMARY_RANGES)
  range: SummaryRange = '1w';
}

export interface RollingSumPointDto {
  date: string;
  rollingSum: number;
}

export interface SummaryPointDto extends RollingSumPointDto {
  isFuture: boolean;
}

export interface LimitCardDto {
  key: string;
  label: string;
  current: number;
  limit: number;
  windowDays: number;
}

export interface SummaryResponseDto {
  range: SummaryRange;
  windowDays: number;
  limit: number;
  yMax: number;
  asOf: string;
  points: SummaryPointDto[];
  cards: LimitCardDto[];
}
