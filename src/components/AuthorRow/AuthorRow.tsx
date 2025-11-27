import styles from './AuthorRow.module.css';

import { Fragment, JSX, ReactNode, useMemo } from 'react';
import { Author, AuthorAchievementType, AuthorEventType } from '../../models';
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
        {events.map(({ notes, dateContext, location, achievement }, index) => {
          let contextElement: JSX.Element | undefined;

          if (showContext) {
            let achievementElement: JSX.Element | undefined;

            if (achievement) {
              let achievementString: ReactNode;

              switch (achievement.type) {
                case AuthorAchievementType.AWARD:
                  achievementString = `Awarded ${achievement.awardName}`;
                  break;
                case AuthorAchievementType.RENOWNED_WORK:
                default:
                  achievementString = `Published ${achievement.workTitle}`;

                  if (achievement.referenceUrl) {
                    achievementString = (
                      <a
                        href={achievement.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {achievementString}
                      </a>
                    );
                  }
                  break;
              }

              achievementElement = <p>{achievementString}</p>;
            }

            contextElement = (
              <>
                {achievementElement}
                {notes && <p>{notes}</p>}
              </>
            );
          }

          return (
            <Fragment key={index}>
              <div className={styles.authorRowRelevantEvent}>
                <div className={styles.authorRowRelevantEventContext}>
                  {contextElement}
                  <p>{dateContext}</p>
                  <p>
                    {location?.address}
                    {location?.state && <span>, {location.state}</span>}
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
