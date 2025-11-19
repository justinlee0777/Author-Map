import { stateToTimezoneMap, USState } from '../models';
import { parse } from 'date-fns';
import { format, fromZonedTime } from 'date-fns-tz';

export function controlForTimezone(date: string): Date {
  return parse(date, 'yyyy-MM-dd', new Date());
}

interface OptionalArgs {
  dateOnly?: boolean;
}

export function formatDate(
  date: string,
  stateName?: USState,
  { dateOnly }: OptionalArgs = {},
): string {
  let dateFormat: string;

  const onlyYearRegex = /^\d{4}$/,
    yearAndMonthRegex = /^\d{4}-\d{2}$/;

  if (onlyYearRegex.test(date)) {
    return date;
  } else if (yearAndMonthRegex.test(date)) {
    dateFormat = 'LLLL, y';
  } else if (dateOnly) {
    dateFormat = 'LLLL dd';
  } else {
    dateFormat = 'LLLL dd, y';
  }

  if (stateName) {
    const timeZone = stateToTimezoneMap.get(stateName)!;

    const zonedDate = fromZonedTime(date, timeZone);

    return format(zonedDate, dateFormat, {
      timeZone,
    });
  } else {
    const parsedDate = controlForTimezone(date);
    return format(parsedDate, dateFormat);
  }
}
