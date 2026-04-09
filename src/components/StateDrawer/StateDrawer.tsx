import styles from './StateDrawer.module.css';
import commonStyles from '../../common.module.css';

import clsx from 'clsx';
import { JSX, ReactNode, useMemo } from 'react';
import { Author, AuthorEventType, MilestoneEvent } from '../../models';
import { createKeyGenerator } from '../../utils/stores';
import { MdClose } from 'react-icons/md';
import { getAuthorName } from '../../utils/names';
import { AuthorRow } from '../AuthorRow/AuthorRow';
import { AddAuthor } from '../AddAuthor/AddAuthor';

interface Props {
  title: string;
  authors: Array<Author>;

  eventType?: AuthorEventType;
  showContext?: boolean;
  onClose?: () => void;
  onEdit?: (author: Author) => void;
  onAddAuthor?: () => void;
}

export function StateDrawer({
  title,
  authors,
  eventType,
  showContext,
  onClose,
  onEdit,
  onAddAuthor,
}: Props): JSX.Element {
  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <div className={clsx(styles.stateDrawerUSState, commonStyles.sideDrawer)}>
      <AddAuthor className={styles.stateDrawerAdd} onClick={onAddAuthor} />
      <h3>
        {title}

        <button
          className={clsx(commonStyles.button, styles.stateDrawerClose)}
          onClick={onClose}
        >
          <MdClose />
        </button>
      </h3>
      <div className={styles.stateDrawerList}>
        {authors.map((author) => {
          let authorName: ReactNode = getAuthorName(author);

          if (author.link) {
            authorName = (
              <a href={author.link} target="_blank" rel="noopener noreferrer">
                {authorName}
              </a>
            );
          }

          let events: Array<Omit<MilestoneEvent, 'id' | 'type'>> = [];

          switch (eventType) {
            case AuthorEventType.BIRTHS:
              events = [author.birthDate];
              break;
            case AuthorEventType.DEATHS:
              if (author.deathDate) {
                events = [author.deathDate];
              }
              break;
          }

          return (
            <AuthorRow
              key={authorKeyGenerator.getKey(author.id)}
              className={styles.stateDrawerAuthorRow}
              author={author}
              events={events}
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
