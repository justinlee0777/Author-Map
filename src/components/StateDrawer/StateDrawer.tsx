import styles from './StateDrawer.module.css';
import commonStyles from '../../common.module.css';

import clsx from 'clsx';
import { JSX, ReactNode, useMemo } from 'react';
import { Author, AuthorEventType, StateStore, USState } from '../../models';
import { AuthorStores, createKeyGenerator } from '../../utils/stores';
import { MdAdd, MdClose } from 'react-icons/md';
import { getAuthorName } from '../../utils/names';
import { AuthorRow } from '../AuthorRow/AuthorRow';

interface Props {
  usState: USState;
  statesData: AuthorStores;
  statesDataKey: keyof StateStore;

  eventType?: AuthorEventType;
  showContext?: boolean;
  onClose?: () => void;
  onEdit?: (author: Author) => void;
  onAddAuthor?: () => void;
}

export function StateDrawer({
  usState,
  statesData,
  statesDataKey,
  eventType,
  showContext,
  onClose,
  onEdit,
  onAddAuthor,
}: Props): JSX.Element {
  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <div className={clsx(styles.stateDrawerUSState, commonStyles.sideDrawer)}>
      <button
        className={clsx(commonStyles.button, styles.stateDrawerAdd)}
        onClick={onAddAuthor}
      >
        <MdAdd />
      </button>
      <h3>
        {usState}

        <button
          className={clsx(commonStyles.button, styles.stateDrawerClose)}
          onClick={onClose}
        >
          <MdClose />
        </button>
      </h3>
      <div className={styles.stateDrawerList}>
        {statesData.get(usState)![statesDataKey].map((author, i) => {
          let authorName: ReactNode = getAuthorName(author);

          if (author.link) {
            authorName = (
              <a href={author.link} target="_blank" rel="noopener noreferrer">
                {authorName}
              </a>
            );
          }

          return (
            <AuthorRow
              key={authorKeyGenerator.getKey(author.id)}
              className={styles.stateDrawerAuthorRow}
              author={author}
              eventType={eventType}
              showContext={showContext}
            >
              <button
                className={clsx(commonStyles.button, styles.stateDrawerEdit)}
                onClick={() => onEdit?.(author)}
              >
                Edit
              </button>
            </AuthorRow>
          );
        })}
      </div>
    </div>
  );
}
