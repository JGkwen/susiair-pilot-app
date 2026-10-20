import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isValidDate } from '../common/date.utils';
import { DocumentsFile, FlightHoursFile, SchedulesFile } from './data.types';

const BUILD_DATA_DIR = __dirname;
const SOURCE_DATA_DIR = join(__dirname, '..', '..', 'data');
const DATA_DIRS = [BUILD_DATA_DIR, SOURCE_DATA_DIR];

@Injectable()
export class DataService {
  readonly flightHours = readJson<FlightHoursFile>('mock-flight-hours.json');
  readonly documents = readJson<DocumentsFile>('mock-documents.json');
  readonly schedules = readJson<SchedulesFile>('mock-schedules.json');

  constructor() {
    const { pilot, flightHours } = this.flightHours;
    check(
      typeof pilot?.name === 'string' &&
        (pilot.totalFlightHours === undefined ||
          Number.isFinite(pilot.totalFlightHours)) &&
        (pilot.avatarUrl === undefined || typeof pilot.avatarUrl === 'string'),
      'mock-flight-hours.json: pilot must be { name, totalFlightHours?, avatarUrl? }',
    );
    check(
      Array.isArray(flightHours) &&
        flightHours.every(
          (r) =>
            isValidDate(r.date) && Number.isFinite(r.hours) && r.hours >= 0,
        ),
      'mock-flight-hours.json: flightHours must be [{ date: YYYY-MM-DD, hours >= 0 }]',
    );

    const { thresholds, documents } = this.documents;
    check(
      Number.isInteger(thresholds?.warningDays) && thresholds.warningDays >= 0,
      'mock-documents.json: thresholds.warningDays must be a whole number >= 0',
    );
    check(
      Array.isArray(documents) &&
        documents.every(
          (d) =>
            typeof d.id === 'string' &&
            typeof d.label === 'string' &&
            isValidDate(d.expiryDate),
        ),
      'mock-documents.json: documents must be [{ id, label, expiryDate: YYYY-MM-DD }]',
    );

    const { legend, schedules } = this.schedules;
    check(
      Array.isArray(legend) &&
        legend.every(
          (l) =>
            typeof l.code === 'string' &&
            typeof l.label === 'string' &&
            typeof l.color === 'string',
        ),
      'mock-schedules.json: legend must be [{ code, label, color }]',
    );
    check(
      Array.isArray(schedules) &&
        schedules.every(
          (s) =>
            isValidDate(s.duty_date) &&
            typeof s.duty_type === 'string' &&
            typeof s.base_name === 'string' &&
            typeof s.base_color === 'string' &&
            Number.isInteger(s.count_schedules) &&
            Number.isInteger(s.count_logbooks),
        ),
      'mock-schedules.json: schedules entries are missing fields or have wrong types',
    );
  }
}

function readJson<T>(file: string): T {
  const path = DATA_DIRS.map((dir) => join(dir, file)).find(existsSync);
  if (!path) {
    throw new Error(`Data file ${file} not found in ${DATA_DIRS.join(' or ')}`);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch (error) {
    throw new Error(
      `Data file ${path} is not valid JSON: ${(error as Error).message}`,
    );
  }
}

function check(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Invalid data. ${message}`);
}
