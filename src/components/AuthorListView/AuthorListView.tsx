import styles from './AuthorListView.module.css';

import { JSX, useMemo } from 'react';
import { AuthorStores, createKeyGenerator } from '../../utils/stores';

interface Props {
  authorStores: AuthorStores;
}

/**
 * Should be able to toggle between a state-primary view or an author-primary view.
 */
export function AuthorListView({ authorStores }: Props): JSX.Element {
  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <div className={styles.authorListView}>
      {authorStores.getAll().map((author) => {
        return <div key={authorKeyGenerator.getKey(author.id)}></div>;
      })}
    </div>
  );
}
