import { Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock.service';
import { roundToOneDecimal } from '../common/number.utils';
import { DataService } from '../data/data.service';
import { PilotProfileDto } from './dto/pilot-profile.dto';

const AVATAR_PLACEHOLDER = '/avatar-placeholder.svg';

@Injectable()
export class PilotService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  getProfile(): PilotProfileDto {
    const { pilot, flightHours } = this.data.flightHours;
    const today = this.clock.today;
    const total =
      pilot.totalFlightHours ??
      flightHours
        .filter((record) => record.date <= today)
        .reduce((sum, record) => sum + record.hours, 0);

    return {
      name: pilot.name,
      totalFlightHours: roundToOneDecimal(total),
      avatarUrl: pilot.avatarUrl ?? AVATAR_PLACEHOLDER,
      asOf: today,
    };
  }
}
