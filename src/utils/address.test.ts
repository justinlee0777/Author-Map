import { USState } from '../models';
import { getAddress } from './address';

describe('getAddress()', () => {
  test('should format addresses', () => {
    expect(
      getAddress({
        address: 'New York City',
        state: USState.NEW_YORK,
      }),
    ).toBe('New York City, New York');

    expect(
      getAddress({
        address: 'New York City',
        state: USState.OKLAHOMA,
      }),
    ).toBe('New York City, Oklahoma');

    expect(
      getAddress({
        state: USState.OKLAHOMA,
      }),
    ).toBe('Oklahoma');

    expect(getAddress({})).toBe('');
  });
});
