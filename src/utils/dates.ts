import { stateToTimezoneMap, USState } from '../models';
import { format, fromZonedTime } from 'date-fns-tz';

export function formatDate(stateName: USState, date: string): string {
  const timeZone = stateToTimezoneMap.get(stateName)!;

  const zonedDate = fromZonedTime(date, timeZone);
  const formattedDateString = format(zonedDate, 'LLLL dd, y', {
    timeZone,
  });

  return formattedDateString;
}
