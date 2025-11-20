import styles from './AuthorTimelineView.module.css';

import { Fragment, JSX, useMemo, useState } from 'react';
import { AuthorStores } from '../../utils/stores';
import clsx from 'clsx';
import { controlForTimezone, formatDate } from '../../utils/dates';
import { getAuthorName } from '../../utils/names';
import { getMilestoneEvents } from '../../utils/events';
import { Author, AuthorGroup, MilestoneEvent } from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';

interface Props {
  statesData: AuthorStores;

  groups?: Array<AuthorGroup>;
  className?: string;
  majorEvents?: Array<MilestoneEvent>;
}

interface AppearanceSettings {
  removeEmptyYears?: boolean;
}

/**
 * TODO: Infinite scroll
 * TODO: Filter by months? Allow a day / month / year filter?
 */
export function AuthorTimelineView({
  statesData,
  className,
  majorEvents = [],
}: Props): JSX.Element {
  const authorEvents: Array<{ author?: Author; event: MilestoneEvent }> =
    statesData
      .getAll()
      .flatMap(
        (author) =>
          getMilestoneEvents(author).map((event) => ({
            author,
            event,
          })) as Array<{ author?: Author; event: MilestoneEvent }>,
      )
      .concat(majorEvents.map((majorEvent) => ({ event: majorEvent })))
      .sort((a, b) => {
        return (
          new Date(a.event.date).valueOf() - new Date(b.event.date).valueOf()
        );
      });

  const firstDate = authorEvents.at(0)!;

  const startingYear = controlForTimezone(firstDate.event.date).getFullYear(),
    endingYear = new Date().getFullYear();

  const authorEventsByYear = new Map<number, typeof authorEvents>();

  authorEvents.forEach((authorEvent) => {
    const { event } = authorEvent;

    const year = controlForTimezone(event.date).getFullYear();

    if (authorEventsByYear.has(year)) {
      authorEventsByYear.get(year)!.push(authorEvent);
    } else {
      authorEventsByYear.set(year, [authorEvent]);
    }
  });

  const [settings, setSettings] = useState<AppearanceSettings>({});

  const eventElements: Array<JSX.Element> = [],
    eventsIterator = authorEventsByYear.entries();

  let currentEvents = eventsIterator.next();

  for (let year = startingYear; year <= endingYear; year++) {
    let authorEvents;

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
                {formatDate(event.date, event.location?.state, {
                  dateOnly: true,
                })}
              </div>

              <div className={styles.authorTimelineEntryBisector}></div>

              <div className={styles.authorTimelineViewEntryDetails}>
                {author && (
                  <h4 className={styles.authorTimelineViewAuthorHeader}>
                    {getAuthorName(author)}
                    {author.portrait?.src && (
                      <img
                        className={styles.authorTimelineViewPortrait}
                        {...author.portrait}
                        loading="lazy"
                      />
                    )}
                  </h4>
                )}
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
