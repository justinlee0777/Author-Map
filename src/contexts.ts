import { createContext } from 'react';
import { AuthorGroup } from './models';

interface AuthorGroupContextValue {
  groups: Array<AuthorGroup>;
}

export const AuthorGroupContext = createContext<AuthorGroupContextValue>({
  groups: [],
});
