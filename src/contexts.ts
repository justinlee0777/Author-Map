import { createContext } from 'react';
import {
  AmericanLiteraryAward,
  AuthorGroup,
  AuthorMapFilters,
  AuthorMapProps,
  ClassicPublisher,
} from './models';
import { AuthorMapStores } from './utils/stores';
import { defaultFormula } from './consts/formula.const';

interface AuthorMapDataContextValue {
  data: AuthorMapStores;
  filters: AuthorMapFilters;
  groups: Array<AuthorGroup>;

  entriesIntoUnion?: AuthorMapProps['entriesIntoUnion'];
  stateCensus?: AuthorMapProps['stateCensus'];
}

export const AuthorMapDataContext = createContext<AuthorMapDataContextValue>({
  data: new AuthorMapStores([], []),
  groups: [],
  filters: {
    eventTypes: ['Birth'],
    inclusionReasons: {
      poetLaureates: true,
      publishers: {
        checked: true,
        collapsed: true,
        specific: {
          [ClassicPublisher.DALKEY]: true,
          [ClassicPublisher.LIBRARY_OF_AMERICA]: true,
          [ClassicPublisher.NORTON]: true,
          [ClassicPublisher.NYRB]: true,
          [ClassicPublisher.PENGUIN_CLASSIC]: true,
        },
      },
      awards: {
        checked: true,
        collapsed: true,
        specific: {
          [AmericanLiteraryAward.NATIONAL_BOOK_FICTION]: true,
          [AmericanLiteraryAward.NATIONAL_BOOK_POETRY]: true,
          [AmericanLiteraryAward.NOBEL_PRIZE_IN_LITERATURE]: true,
          [AmericanLiteraryAward.PULITZER_FICTION]: true,
          [AmericanLiteraryAward.PULITZER_POETRY]: true,
        },
      },
      personal: false,
      authorGroup: true,
    },
    formula: {
      equation: defaultFormula,
      threshold: 0,
    },
    yearRange: [-Infinity, Infinity],
  },
});
