import { USState } from '../models';
import { formatDate } from './dates';

describe('formatDate()', () => {
  test('should format the full YYYY-MM-DD', () => {
    expect(formatDate('1994-04-17', USState.ALABAMA)).toBe('April 17, 1994');
  });

  test('should format without the specific date', () => {
    expect(formatDate('1999-04', USState.ALABAMA)).toBe('April, 1999');
  });

  test('should format only the year', () => {
    expect(formatDate('1994', USState.ALABAMA)).toBe('1994');
  });

  test('should format dates by timezone, under the expectation all given dates are adjusted', () => {
    expect(formatDate('1994-04-17', USState.ALABAMA)).toBe('April 17, 1994');

    expect(formatDate('1994-04-17', USState.COLORADO)).toBe('April 17, 1994');

    expect(formatDate('1994-04-17', USState.ILLINOIS)).toBe('April 17, 1994');

    expect(formatDate('1994-04-17', USState.CALIFORNIA)).toBe('April 17, 1994');

    expect(formatDate('1994-04-17', USState.WASHINGTON)).toBe('April 17, 1994');

    expect(formatDate('1994-04-17', USState.VIRGINIA)).toBe('April 17, 1994');

    expect(formatDate('1994-04-17', USState.VERMONT)).toBe('April 17, 1994');

    expect(formatDate('1994-04-17', USState.ALASKA)).toBe('April 17, 1994');
  });
});
