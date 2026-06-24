import clsx from 'clsx';
import { JSX, ReactNode, useContext, useMemo } from 'react';
import { Author, AuthorEventType, AuthorTimelineEvent } from '../../models';
import { createKeyGenerator } from '../../utils/stores';
import { MdClose } from 'react-icons/md';
import { getAuthorName } from '../../utils/names';
import { AuthorRow } from '../AuthorRow/AuthorRow';
import { AddAuthor } from '../AddAuthor/AddAuthor';
import { AuthorMapDataContext } from '../../contexts';

interface Props {
  title: string;
  authors: Array<Author>;

  eventType?: AuthorEventType;
  onClose?: () => void;
  onEdit?: (author: Author) => void;
  onView?: (author: Author) => void;
  onAddAuthor?: () => void;
}

export function StateDrawer({
  title,
  authors,
  eventType,
  onClose,
  onEdit,
  onView,
  onAddAuthor,
}: Props): JSX.Element {
  const { data } = useContext(AuthorMapDataContext);

  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <div className={clsx('stateDrawerUSState', 'sideDrawer')}>
      <AddAuthor className="stateDrawerAdd" onClick={onAddAuthor} />
      <h3>
        {title}

        <button
          className={clsx('button', 'stateDrawerClose')}
          onClick={onClose}
        >
          <MdClose />
        </button>
      </h3>
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

          switch (eventType) {
            case AuthorEventType.BIRTHS:
              if (birthDate) {
                events = [birthDate];
              }
              break;
            case AuthorEventType.DEATHS:
              if (deathDate) {
                events = [deathDate];
              }
              break;
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
    </div>
  );
}
