import { createContext } from 'react';
import {
  AmericanLiteraryAward,
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
      authorGroup: false,
    },
    formula: {
      equation: {
        'Because I said so; source: me': {
          type: 'scale',
          value: 0,
        },
        'Belongs to a renowned group': {
          type: 'tanh',
        },
        'Poet Laureate': {
          type: 'scale',
          value: 2,
        },
        award: {
          type: 'tanh',
        },
        'Published as classical literature': {
          type: 'tanh',
        },
      },
      threshold: 0,
    },
    yearRange: [-Infinity, Infinity],
  },
});
