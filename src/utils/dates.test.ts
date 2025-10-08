import { USState } from '../models';
import { formatDate } from './dates';

describe('formatDate()', () => {
  test('should format the full YYYY-MM-DD', () => {
    expect(formatDate(USState.ALABAMA, '1994-04-17')).toBe('April 17, 1994');
  });

  test('should format without the specific date', () => {
    expect(formatDate(USState.ALABAMA, '1999-04')).toBe('April, 1999');
  });

  test('should format only the year', () => {
    expect(formatDate(USState.ALABAMA, '1994')).toBe('1994');
  });

  test('should format dates by timezone, under the expectation all given dates are adjusted', () => {
    expect(formatDate(USState.ALABAMA, '1994-04-17')).toBe('April 17, 1994');

    expect(formatDate(USState.COLORADO, '1994-04-17')).toBe('April 17, 1994');

    expect(formatDate(USState.ILLINOIS, '1994-04-17')).toBe('April 17, 1994');

    expect(formatDate(USState.CALIFORNIA, '1994-04-17')).toBe('April 17, 1994');

    expect(formatDate(USState.WASHINGTON, '1994-04-17')).toBe('April 17, 1994');

    expect(formatDate(USState.VIRGINIA, '1994-04-17')).toBe('April 17, 1994');

    expect(formatDate(USState.VERMONT, '1994-04-17')).toBe('April 17, 1994');

    expect(formatDate(USState.ALASKA, '1994-04-17')).toBe('April 17, 1994');
  });
});
