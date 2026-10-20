import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isValidDate } from './date.utils';

const DEFAULT_TODAY = '2026-05-15';

@Injectable()
export class ClockService {
  readonly today: string;

  constructor(config: ConfigService) {
    const today = config.get<string>('APP_TODAY', DEFAULT_TODAY);
    if (!isValidDate(today)) {
      throw new Error(
        `APP_TODAY must be a real date in YYYY-MM-DD format, got "${today}"`,
      );
    }
    this.today = today;
  }
}
