import { createContext } from 'react';
import {
  AmericanLiteraryAward,
  AuthorEventType,
  AuthorGroup,
  AuthorMapFilters,
  ClassicPublisher,
} from './models';
import { AuthorMapStores } from './utils/stores';

interface AuthorMapDataContextValue {
  data: AuthorMapStores;
  filters: AuthorMapFilters;
  groups: Array<AuthorGroup>;
}

export const AuthorMapDataContext = createContext<AuthorMapDataContextValue>({
  data: new AuthorMapStores([], []),
  groups: [],
  filters: {
    eventType: AuthorEventType.BIRTHS,
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
    },
  },
});
