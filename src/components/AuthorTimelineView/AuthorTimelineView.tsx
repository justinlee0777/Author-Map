import { JSX, useContext, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import type {
  Author,
  AuthorGroup,
  AuthorTimelineEvent,
  TimelineEvent,
} from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { AuthorMapDataContext } from '../../contexts';
import { AuthorTimelineEntry } from './AuthorTimelineEntry';
import infiniteScroll from '../../utils/infinite-scroll';

interface Props {
  groups?: Array<AuthorGroup>;
  className?: string;
  onAuthorView?: (author: Author) => void;
}

interface AppearanceSettings {
  removeEmptyYears?: boolean;
}

/**
 * TODO: Filter by months? Allow a day / month / year filter?
 * TODO: Need to limit the amount of data shown at a time
 */
export function AuthorTimelineView({
  className,
  onAuthorView,
}: Props): JSX.Element {
  const {
    data: statesData,
    filters: { eventType },
  } = useContext(AuthorMapDataContext);

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
      if (!eventType || timelineEvent.type === eventType) {
        const year = Number(timelineEvent.date.split('-').at(0)!);

        if (map.has(year)) {
          map.get(year)!.push(timelineEvent);
        } else {
          map.set(year, [timelineEvent]);
        }
      }
    });

    return map;
  }, [timelineEvents, eventType]);

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
        <AuthorTimelineEntry
          key={year}
          year={year}
          events={events}
          onAuthorView={onAuthorView}
        />,
      );
    }

    return temp;
  }, [settings, statesData, eventType]);

  const initialEntriesShown = 10;

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
    <div className={clsx('authorTimelineView', className)}>
      <ul className="authorTimelineViewEntries" ref={entriesRef}>
        {eventElements.slice(0, entriesShown)}
      </ul>
      <div className="authorTimelineViewSettings">
        <Radiogroup<keyof AppearanceSettings>
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
