import { Author, USState } from '../models';
import { createStores, transformAuthors } from './stores';

const authors: Array<Author> = [
  {
    authorFirstName: 'John',
    authorLastName: 'Smith',
    birthDate: {
      date: '1992',
      location: {
        state: USState.ALABAMA,
        address: 'Foo',
      },
    },
    timeline: [],
  },
  {
    authorFirstName: 'Alan',
    authorLastName: 'Smithee',
    birthDate: {
      date: '1989',
      location: {
        state: USState.ALABAMA,
        address: 'Bar',
      },
    },
    timeline: [],
  },
  {
    authorFirstName: 'John',
    authorLastName: 'Doe',
    birthDate: {
      date: '1997',
      location: {
        state: USState.FLORIDA,
        address: 'Baz',
      },
    },
    timeline: [
      {
        startDate: '2000-02',
        endDate: '2001-04',
        location: {
          state: USState.CONNECTICUT,
          address: 'FooBar',
        },
        notes: 'Attended so-and-so elementary school.',
      },
    ],
  },
];

describe('transformAuthors()', () => {
  test('should assign an ID for each author', () => {
    const transformedAuthors = transformAuthors(authors);

    expect(transformedAuthors.length).toBe(3);

    for (const author of transformedAuthors) {
      expect(author.id).toBeDefined();
    }
  });
});

describe('createStores()', () => {
  test('should sort and populate author data', () => {
    const transformedAuthors = transformAuthors(authors);

    const stores = createStores(transformedAuthors);

    const alabamaStore = stores.get(USState.ALABAMA)!;

    expect(alabamaStore.bornAuthors.length).toBe(2);

    expect(alabamaStore.bornAuthors[0].authorFirstName).toBe('John');
    expect(alabamaStore.bornAuthors[0].authorLastName).toBe('Smith');

    expect(alabamaStore.bornAuthors[1].authorFirstName).toBe('Alan');
    expect(alabamaStore.bornAuthors[1].authorLastName).toBe('Smithee');

    expect(alabamaStore.bornAuthors[0].events).toEqual([
      {
        address: 'Foo',
        context: 'Birth',
        date: '1992',
      },
    ]);

    expect(alabamaStore.bornAuthors[1].events).toEqual([
      {
        address: 'Bar',
        context: 'Birth',
        date: '1989',
      },
    ]);

    const arizonaStore = stores.get(USState.ARIZONA)!;

    expect(arizonaStore.bornAuthors.length).toBe(0);

    const floridaStore = stores.get(USState.FLORIDA)!;

    expect(floridaStore.bornAuthors.length).toBe(1);

    expect(floridaStore.bornAuthors[0].authorFirstName).toBe('John');
    expect(floridaStore.bornAuthors[0].authorLastName).toBe('Doe');

    expect(floridaStore.bornAuthors[0].events).toEqual([
      {
        address: 'Baz',
        context: 'Birth',
        date: '1997',
      },
    ]);

    const connecticutStore = stores.get(USState.CONNECTICUT)!;

    expect(connecticutStore.residingAuthors[0].events).toEqual([
      {
        address: 'FooBar',
        context: 'Attended so-and-so elementary school.',
        date: 'February, 2000 - April, 2001',
      },
    ]);
  });
});
