import styles from './AuthorRow.module.css';

import { Fragment, JSX, ReactNode, useMemo } from 'react';
import { Author, AuthorEventType } from '../../models';
import { getAuthorName } from '../../utils/names';
import { getEvents } from '../../utils/events';
import clsx from 'clsx';

interface Props {
  author: Author;

  className?: string;
  showContext?: boolean;
  children?: ReactNode;
  eventType?: AuthorEventType;
}

export function AuthorRow({
  author,
  className,
  showContext,
  children,
  eventType,
}: Props): JSX.Element {
  const authorName = useMemo(() => getAuthorName(author), [author]);

  const events = useMemo(
    () => getEvents(author, { eventType }),
    [author, eventType],
  );

  return (
    <div className={clsx(styles.authorRow, className)}>
      {author.portrait && author.portrait.src && (
        <img {...author.portrait} loading="lazy" />
      )}
      <div className={styles.authorRowDetails}>
        <h4>{authorName}</h4>
        {events.map(({ notes, dateContext, location }, index) => {
          return (
            <Fragment key={index}>
              <div className={styles.authorRowRelevantEvent}>
                <div className={styles.authorRowRelevantEventContext}>
                  {showContext && notes && <b>{notes}</b>}
                  <p>{dateContext}</p>
                  <p>
                    {location.address}
                    {location.state && <span>, {location.state}</span>}
                  </p>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
      {children}
    </div>
  );
}
