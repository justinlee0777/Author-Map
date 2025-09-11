import { stateToTimezoneMap, USState } from '../models';
import { format, fromZonedTime } from 'date-fns-tz';

export function formatDate(stateName: USState, date: string): string {
  const timeZone = stateToTimezoneMap.get(stateName)!;

  const zonedDate = fromZonedTime(date, timeZone);
  let dateFormat: string;

  const onlyYearRegex = /^\d{4}$/,
    yearAndMonthRegex = /^\d{4}-\d{2}$/;

  if (onlyYearRegex.test(date)) {
    dateFormat = 'y';
  } else if (yearAndMonthRegex.test(date)) {
    dateFormat = 'LLLL, y';
  } else {
    dateFormat = 'LLLL dd, y';
  }

  return format(zonedDate, dateFormat, {
    timeZone,
  });
}
