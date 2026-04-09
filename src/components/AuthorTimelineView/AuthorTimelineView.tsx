import styles from './AuthorTimelineView.module.css';

import {
  Fragment,
  JSX,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import { controlForTimezone, formatDate } from '../../utils/dates';
import { getAuthorName } from '../../utils/names';
import {
  Author,
  AuthorAchievementType,
  AuthorGroup,
  AuthorTimelineEvent,
  MilestoneEvent,
} from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import infiniteScroll from '../../utils/infinite-scroll';
import { AuthorMapDataContext } from '../../contexts';

interface Props {
  groups?: Array<AuthorGroup>;
  className?: string;
}

interface AppearanceSettings {
  removeEmptyYears?: boolean;
}

/**
 * TODO: Filter by months? Allow a day / month / year filter?
 */
export function AuthorTimelineView({ className }: Props): JSX.Element {
  const { data: statesData } = useContext(AuthorMapDataContext);

  const entriesRef = useRef<HTMLUListElement>(null);

  const timelineEvents = statesData.timelineEvents.filter(
    (event) => event.type === 'Milestone',
  ) as Array<MilestoneEvent>;

  const firstDate = timelineEvents.at(0)!;

  const startingYear = controlForTimezone(firstDate.date).getFullYear(),
    endingYear = new Date().getFullYear();

  const [settings, setSettings] = useState<AppearanceSettings>({});

  const timelineEventsByYear = new Map<number, typeof timelineEvents>();

  timelineEvents.forEach((timelineEvent) => {
    const year = controlForTimezone(timelineEvent.date).getFullYear();

    if (timelineEventsByYear.has(year)) {
      timelineEventsByYear.get(year)!.push(timelineEvent);
    } else {
      timelineEventsByYear.set(year, [timelineEvent]);
    }
  });

  const eventElements: Array<JSX.Element> = useMemo(() => {
    const temp: Array<JSX.Element> = [];

    const eventsIterator = timelineEventsByYear.entries();

    let currentEvents = eventsIterator.next();

    for (let year = startingYear; year <= endingYear; year++) {
      let events;

      if (currentEvents.value && currentEvents.value[0] === year) {
        [, events] = currentEvents.value;

        currentEvents = eventsIterator.next();
      } else if (settings.removeEmptyYears) {
        continue;
      }

      temp.push(
        <li className={styles.authorTimelineViewEntry} key={year}>
          <h4 className={styles.authorTimelineViewYear}>{year}</h4>
          <div className={styles.authorTimelineViewEntryBullet}></div>
          {events?.map((event, i) => {
            let achievementElement: JSX.Element | undefined;

            const author = event.authorId
              ? statesData.getAuthor(event.authorId)
              : undefined;

            if (event.achievement) {
              switch (event.achievement.type) {
                case AuthorAchievementType.AWARD:
                  achievementElement = (
                    <p>Awarded {event.achievement.awardName}</p>
                  );
                  break;
                case AuthorAchievementType.RENOWNED_WORK:
                default:
                  let workTitleElement = (
                    <span>{event.achievement.workTitle}</span>
                  );

                  if (event.achievement.referenceUrl) {
                    workTitleElement = (
                      <a
                        href={event.achievement.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {workTitleElement}
                      </a>
                    );
                  }

                  achievementElement = <p>Known work: {workTitleElement} </p>;
                  break;
              }
            }

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

                  {achievementElement}

                  <p>{event.notes}</p>
                </div>
              </Fragment>
            );
          })}
        </li>,
      );
    }

    return temp;
  }, [settings, statesData]);

  const initialEntriesShown = 20;

  const [entriesShown, setEntriesShown] = useState(initialEntriesShown);

  useEffect(() => {
    if (entriesRef.current) {
      const destroyInfiniteScroll = infiniteScroll(entriesRef.current, () =>
        setEntriesShown(
          Math.min(entriesShown + initialEntriesShown, eventElements.length),
        ),
      );

      return () => {
        destroyInfiniteScroll();
      };
    }
  }, [entriesRef.current, entriesShown]);

  return (
    <div className={clsx(styles.authorTimelineView, className)}>
      <ul className={styles.authorTimelineViewEntries} ref={entriesRef}>
        {eventElements.slice(0, entriesShown)}
      </ul>
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
