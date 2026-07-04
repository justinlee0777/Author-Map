import {
  AuthorTimelineEvent,
  monthOptions,
  stateToTimezoneMap,
  USState,
} from '../models';

interface OptionalArgs {
  dateOnly?: boolean;
}

function getMonthName(monthString: string): string {
  const monthNumber = Number(monthString);

  return monthOptions.find(({ value }) => value === monthNumber)!.label;
}

export function formatDate(
  date: string,
  { dateOnly }: OptionalArgs = {},
): string {
  const [year, month, day] = date.split(/T|-/);

  if (day) {
    const monthName = getMonthName(month);

    if (dateOnly) {
      return `${monthName} ${Number(day)}`;
    } else {
      return `${getMonthName(month)} ${Number(day)}, ${year}`;
    }
  } else if (month) {
    return `${getMonthName(month)}, ${year}`;
  } else {
    return year;
  }
}

export function getStartingDate(event: AuthorTimelineEvent): string {
  if ('date' in event) {
    return event.date;
  } else {
    return event.startDate;
  }
}
