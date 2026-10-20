export interface FlightHoursFile {
  pilot: { name: string; totalFlightHours?: number; avatarUrl?: string };
  limits?: Partial<Record<string, number>>;
  chartBounds?: Partial<Record<string, { limit?: number; max?: number }>>;
  flightHours: { date: string; hours: number }[];
}

export interface DocumentsFile {
  thresholds: { warningDays: number };
  documents: { id: string; label: string; expiryDate: string }[];
}

export interface SchedulesFile {
  legend: { code: string; label: string; color: string }[];
  schedules: {
    id: string;
    duty_date: string;
    duty_type: string;
    base_name: string;
    base_color: string;
    count_schedules: number;
    count_logbooks: number;
  }[];
}
