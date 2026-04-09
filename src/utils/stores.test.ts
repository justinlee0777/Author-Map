import { Author, USState } from '../models';
import { AuthorMapStores } from './stores';

const authors: Array<Author> = [
  {
    id: Symbol('ID for John Smith'),
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
    id: Symbol('ID for Alan Smithee'),
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
    id: Symbol('ID for John Doe'),
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

describe('AuthorStores', () => {
  test('should sort and populate author data', () => {
    const stores = new AuthorMapStores(authors);

    const alabamaStore = stores.get(USState.ALABAMA)!;

    expect(alabamaStore.bornAuthors.length).toBe(2);

    expect(alabamaStore.bornAuthors[0].authorFirstName).toBe('Alan');
    expect(alabamaStore.bornAuthors[0].authorLastName).toBe('Smithee');

    expect(alabamaStore.bornAuthors[1].authorFirstName).toBe('John');
    expect(alabamaStore.bornAuthors[1].authorLastName).toBe('Smith');

    const arizonaStore = stores.get(USState.ARIZONA)!;

    expect(arizonaStore.bornAuthors.length).toBe(0);

    const floridaStore = stores.get(USState.FLORIDA)!;

    expect(floridaStore.bornAuthors.length).toBe(1);

    expect(floridaStore.bornAuthors[0].authorFirstName).toBe('John');
    expect(floridaStore.bornAuthors[0].authorLastName).toBe('Doe');
  });
});
