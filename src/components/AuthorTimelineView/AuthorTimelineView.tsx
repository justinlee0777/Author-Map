import styles from './AuthorTimelineView.module.css';

import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import { controlForTimezone } from '../../utils/dates';
import { AuthorGroup, AuthorTimelineEvent, TimelineEvent } from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { AuthorMapDataContext } from '../../contexts';
import { AuthorTimelineEntry } from './AuthorTimelineEntry';

interface Props {
  groups?: Array<AuthorGroup>;
  className?: string;
}

interface AppearanceSettings {
  removeEmptyYears?: boolean;
}

type TimelineEntryItem = Omit<
  Parameters<typeof AuthorTimelineEntry>[0],
  'dataRow'
>;

/**
 * TODO: Filter by months? Allow a day / month / year filter?
 */
export function AuthorTimelineView({ className }: Props): JSX.Element {
  const { data: statesData } = useContext(AuthorMapDataContext);

  const [startingYear, endingYear] = statesData.dateRange;

  const entriesRef = useRef<HTMLUListElement>(null);

  const timelineEvents = statesData.timelineEvents.filter((event) => {
    switch (event.type) {
      case 'Birth':
      case 'Death':
        return true;
      default:
        return false;
    }
  }) as Array<Exclude<AuthorTimelineEvent, TimelineEvent>>;

  const [settings, setSettings] = useState<AppearanceSettings>({
    removeEmptyYears: true,
  });

  const timelineEventsByYear = useMemo(() => {
    const map = new Map<number, typeof timelineEvents>();

    timelineEvents.forEach((timelineEvent) => {
      const year = controlForTimezone(timelineEvent.date).getFullYear();

      if (map.has(year)) {
        map.get(year)!.push(timelineEvent);
      } else {
        map.set(year, [timelineEvent]);
      }
    });

    return map;
  }, [timelineEvents]);

  const constructTimelineEntries = useCallback(
    (appSettings: AppearanceSettings) => {
      const temp: Array<TimelineEntryItem> = [];

      const eventsIterator = timelineEventsByYear.entries();

      let currentEvents = eventsIterator.next();

      for (let year = startingYear; year <= endingYear; year++) {
        let events;

        if (currentEvents.value && currentEvents.value[0] === year) {
          [, events] = currentEvents.value;

          currentEvents = eventsIterator.next();
        } else if (appSettings.removeEmptyYears) {
          continue;
        }

        temp.push({
          year,
          events,
          show: false,
        });
      }

      return temp;
    },
    [],
  );

  const [timelineEntries, setTimelineEntries] = useState(() =>
    constructTimelineEntries(settings),
  );

  useEffect(() => {
    const entriesElement = entriesRef.current;

    if (entriesElement) {
      const rowsToShow: Set<number> = new Set();

      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const rowNumber = Number(
              (entry.target as HTMLElement).dataset.row!,
            );

            if (entry.isIntersecting) {
              rowsToShow.add(rowNumber);
            } else {
              rowsToShow.delete(rowNumber);
            }
          }

          setTimelineEntries((timelineEntries) =>
            timelineEntries.map((entry, i) => {
              return {
                ...entry,
                show: rowsToShow.has(i),
              };
            }),
          );
        },
        { rootMargin: '1000px 0px', threshold: 0.1 },
      );

      const listElements = entriesElement.children;

      for (const listElement of listElements) {
        intersectionObserver.observe(listElement);
      }

      return () => {
        intersectionObserver.disconnect();

        for (const listElement of listElements) {
          intersectionObserver.unobserve(listElement);
        }
      };
    }
  }, [setTimelineEntries]);

  return (
    <div className={clsx(styles.authorTimelineView, className)}>
      <ul className={styles.authorTimelineViewEntries} ref={entriesRef}>
        {timelineEntries.map((props, i) => (
          <AuthorTimelineEntry key={i} dataRow={i} {...props} />
        ))}
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
