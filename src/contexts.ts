import { createContext } from 'react';
import { AuthorGroup } from './models';
import { AuthorMapStores } from './utils/stores';

interface AuthorMapDataContextValue {
  data: AuthorMapStores;
}

export const AuthorMapDataContext = createContext<AuthorMapDataContextValue>({
  data: new AuthorMapStores([], []),
});

interface AuthorGroupContextValue {
  groups: Array<AuthorGroup>;
}

export const AuthorGroupContext = createContext<AuthorGroupContextValue>({
  groups: [],
});
