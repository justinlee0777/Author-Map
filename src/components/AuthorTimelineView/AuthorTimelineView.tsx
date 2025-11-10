import styles from './AuthorTimelineView.module.css';

import { Fragment, JSX, useMemo, useState } from 'react';
import { AuthorStores } from '../../utils/stores';
import clsx from 'clsx';
import { formatDate } from '../../utils/dates';
import { getAuthorName } from '../../utils/names';
import { getMilestoneEvents } from '../../utils/events';
import { Author, MilestoneEvent } from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';

interface Props {
  statesData: AuthorStores;

  className?: string;
}

interface AppearanceSettings {
  removeEmptyYears?: boolean;
}

/**
 * TODO: Infinite scroll
 */
export function AuthorTimelineView({
  statesData,
  className,
}: Props): JSX.Element {
  const [authorEventsByYear, startingYear, endingYear]: [
    Map<number, Array<{ author: Author; event: MilestoneEvent }>>,
    number,
    number,
  ] = useMemo(() => {
    const authorEvents = statesData
      .getAll()
      .flatMap((author) =>
        getMilestoneEvents(author).map((event) => ({ author, event })),
      )
      .sort((a, b) => {
        return (
          new Date(a.event.date).valueOf() - new Date(b.event.date).valueOf()
        );
      });

    const firstDate = authorEvents.at(0)!;

    const yearStart = new Date(firstDate.event.date).getFullYear();

    const map = new Map<
      number,
      Array<{ author: Author; event: MilestoneEvent }>
    >();

    authorEvents.forEach((authorEvent) => {
      const { event } = authorEvent;

      const year = new Date(event.date).getFullYear();

      if (map.has(year)) {
        map.get(year)!.push(authorEvent);
      } else {
        map.set(year, [authorEvent]);
      }
    });

    return [map, yearStart, new Date().getFullYear()];
  }, [statesData]);

  const [settings, setSettings] = useState<AppearanceSettings>({});

  const eventElements: Array<JSX.Element> = [],
    eventsIterator = authorEventsByYear.entries();

  let currentEvents = eventsIterator.next();

  for (let year = startingYear; year <= endingYear; year++) {
    let authorEvents:
      | Array<{
          author: Author;
          event: MilestoneEvent;
        }>
      | undefined;

    if (currentEvents.value && currentEvents.value[0] === year) {
      [, authorEvents] = currentEvents.value;

      currentEvents = eventsIterator.next();
    } else if (settings.removeEmptyYears) {
      continue;
    }

    eventElements.push(
      <li className={styles.authorTimelineViewEntry} key={year}>
        <h4 className={styles.authorTimelineViewYear}>{year}</h4>
        <div className={styles.authorTimelineViewEntryBullet}></div>
        {authorEvents?.map(({ author, event }, i) => {
          return (
            <Fragment key={i}>
              <div className={styles.authorTimelineEventDate}>
                {formatDate(event.date, event.location.state, {
                  dateOnly: true,
                })}
              </div>

              <div className={styles.authorTimelineEntryBisector}></div>

              <div className={styles.authorTimelineViewEntryDetails}>
                <h4 className={styles.authorTimelineViewAuthorHeader}>
                  {getAuthorName(author)}
                  {author.portrait && (
                    <img
                      className={styles.authorTimelineViewPortrait}
                      {...author.portrait}
                    />
                  )}
                </h4>
                <p>{event.notes}</p>
              </div>
            </Fragment>
          );
        })}
      </li>,
    );
  }

  return (
    <div className={clsx(styles.authorTimelineView, className)}>
      <ul className={styles.authorTimelineViewEntries}>{eventElements}</ul>
      <div className={styles.authorTimelineViewSettings}>
        <Radiogroup<keyof AppearanceSettings>
          className={styles.authorTimelineViewAppearance}
          header="Appearance"
          id="timeline-settings"
          type="checkbox"
          options={[
            {
              label: 'Remove empty years',
              value: 'removeEmptyYears',
            },
          ]}
          selected={Object.entries(settings).reduce(
            (acc, [key, value]) => {
              if (value) {
                return acc.concat(key as keyof AppearanceSettings);
              } else {
                return acc;
              }
            },
            [] as Array<keyof AppearanceSettings>,
          )}
          onChange={(value) => {
            setSettings((currentSettings) => {
              if (value in currentSettings) {
                return {
                  ...currentSettings,
                  [value]: !currentSettings[value],
                };
              } else {
                return {
                  ...currentSettings,
                  [value]: true,
                };
              }
            });
          }}
        />
      </div>
    </div>
  );
}
