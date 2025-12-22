import { Author, AuthorEventType, USState } from '../models';
import { getEvents } from './events';

describe('getEvents()', () => {
  const sampleAuthor: Author = {
    id: Symbol('Symbol for John Doe'),
    authorFirstName: 'John',
    authorLastName: 'Doe',
    birthDate: {
      date: '1977-08-08',
      location: {
        state: USState.LOUISIANA,
      },
    },
    timeline: [
      {
        date: '1978-02-12',
        notes: 'Foo',
      },
      {
        startDate: '1980',
        endDate: '1999',
        notes: 'Bar',
        location: {
          state: USState.LOUISIANA,
        },
      },
    ],
    deathDate: {
      date: '2020-01-17',
    },
  };

  test('should retrieve author timeline events', () => {
    expect(getEvents(sampleAuthor)).toEqual([
      {
        dateContext: 'August 08, 1977',
        eventType: 'Births',
        notes: 'Birth',
        date: '1977-08-08',
        location: {
          state: USState.LOUISIANA,
        },
      },
      {
        dateContext: 'February 12, 1978',
        date: '1978-02-12',
        notes: 'Foo',
      },
      {
        dateContext: '1980 - 1999',
        startDate: '1980',
        endDate: '1999',
        notes: 'Bar',
        location: {
          state: USState.LOUISIANA,
        },
      },
      {
        date: '2020-01-17',
        dateContext: 'January 17, 2020',
        eventType: 'Deaths',
        notes: 'Death',
      },
    ]);
  });

  test('should filter events by state', () => {
    expect(getEvents(sampleAuthor, { usState: USState.LOUISIANA })).toEqual([
      {
        dateContext: 'August 08, 1977',
        eventType: 'Births',
        notes: 'Birth',
        date: '1977-08-08',
        location: {
          state: USState.LOUISIANA,
        },
      },
      {
        dateContext: '1980 - 1999',
        startDate: '1980',
        endDate: '1999',
        notes: 'Bar',
        location: {
          state: USState.LOUISIANA,
        },
      },
    ]);
  });

  test('should filter by event', () => {
    expect(
      getEvents(sampleAuthor, { eventType: AuthorEventType.BIRTHS }),
    ).toEqual([
      {
        dateContext: 'August 08, 1977',
        eventType: 'Births',
        notes: 'Birth',
        date: '1977-08-08',
        location: {
          state: USState.LOUISIANA,
        },
      },
    ]);

    expect(
      getEvents(sampleAuthor, { eventType: AuthorEventType.DEATHS }),
    ).toEqual([
      {
        date: '2020-01-17',
        dateContext: 'January 17, 2020',
        eventType: 'Deaths',
        notes: 'Death',
      },
    ]);
  });
});
