import clsx from 'clsx';
import { JSX, ReactNode, useContext, useMemo } from 'react';

import { Author, AuthorTimelineEvent } from '../../models';
import { createKeyGenerator } from '../../utils/stores';
import { getAuthorName } from '../../utils/names';
import { AuthorRow } from '../AuthorRow/AuthorRow';
import { AddAuthor } from '../AddAuthor/AddAuthor';
import { AuthorMapDataContext } from '../../contexts';
import { SideDrawer } from '../SideDrawer';

interface Props {
  title: string;
  authors: Array<Author>;
  eventTypes: Array<AuthorTimelineEvent['type']>;

  onClose?: () => void;
  onEdit?: (author: Author) => void;
  onView?: (author: Author) => void;
  onAddAuthor?: () => void;
}

export function StateDrawer({
  title,
  authors,
  eventTypes,
  onClose,
  onEdit,
  onView,
  onAddAuthor,
}: Props): JSX.Element {
  const { data } = useContext(AuthorMapDataContext);

  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <SideDrawer className="stateDrawerUSState" title={title} onClose={onClose}>
      <AddAuthor className="stateDrawerAdd" onClick={onAddAuthor} />

      <div className="stateDrawerList">
        {authors.map((author) => {
          let authorName: ReactNode = getAuthorName(author);

          if (author.link) {
            authorName = (
              <a href={author.link} target="_blank" rel="noopener noreferrer">
                {authorName}
              </a>
            );
          }

          const birthDate = data.getBirthDate(author.id),
            deathDate = data.getDeathDate(author.id);

          let events: Array<AuthorTimelineEvent> = [];

          for (const eventType of eventTypes) {
            switch (eventType) {
              case 'Birth':
                if (birthDate) {
                  events.push(birthDate);
                }
                break;
              case 'Death':
                if (deathDate) {
                  events.push(deathDate);
                }
                break;
            }
          }

          return (
            <AuthorRow
              key={authorKeyGenerator.getKey(author.id)}
              className="stateDrawerAuthorRow"
              author={author}
              events={events}
            >
              <button
                className={clsx('button', 'stateDrawerEdit')}
                onClick={() => onEdit?.(author)}
              >
                Edit
              </button>
              <button
                className={clsx('button', 'stateDrawerView')}
                onClick={() => onView?.(author)}
              >
                View
              </button>
            </AuthorRow>
          );
        })}
      </div>
    </SideDrawer>
  );
}
