import { ValidateBy } from 'class-validator';
import { isValidDate } from './date.utils';

export const IsCalendarDate = () =>
  ValidateBy({
    name: 'isCalendarDate',
    validator: {
      validate: isValidDate,
      defaultMessage: () =>
        '$property must be a real date in YYYY-MM-DD format',
    },
  });
