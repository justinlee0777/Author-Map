import { USState } from '../models';
import { getAuthorName } from './names';

describe('getAuthorName()', () => {
  test('should always provide the full name', () => {
    expect(
      getAuthorName({
        authorFirstName: 'John',
        authorLastName: 'Smith',
        authorFullName: 'John T. Smith',
        birthDate: {
          location: {
            state: USState.ALABAMA,
            address: 'Foo',
          },
          date: '1994-04-17',
        },
        timeline: [],
      }),
    ).toBe('John T. Smith');
  });

  test('should provide a constructed name', () => {
    expect(
      getAuthorName({
        authorFirstName: 'John',
        authorLastName: 'Smith',
        birthDate: {
          location: {
            state: USState.ALABAMA,
            address: 'Foo',
          },
          date: '1994-04-17',
        },
        timeline: [],
      }),
    ).toBe('John Smith');
  });
});
