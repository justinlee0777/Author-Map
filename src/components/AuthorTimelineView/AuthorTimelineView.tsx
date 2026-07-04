import { JSX, useContext, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import type { Author, AuthorGroup, AuthorTimelineEvent } from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { AuthorMapDataContext } from '../../contexts';
import { AuthorTimelineEntry } from './AuthorTimelineEntry';
import infiniteScroll from '../../utils/infinite-scroll';
import { AuthorMapStores } from '../../utils/stores';
import { convertValuesToFilters } from '../InclusionReasonSelect/InclusionReasonSelect';
import { sortMap } from '../../utils/sort';

interface Props {
  groups?: Array<AuthorGroup>;
  className?: string;
  onAuthorView?: (author: Author) => void;
}

interface AppearanceSettings {
  removeEmptyYears?: boolean;
  includeMajorEvents?: boolean;
}

/**
 * TODO: Filter by months? Allow a day / month / year filter?
 */
export function AuthorTimelineView({
  className,
  onAuthorView,
}: Props): JSX.Element {
  const {
    data: statesData,
    filters: {
      eventTypes,
      yearRange,
      search,
      groupId,
      inclusionReasons,
      formula,
    },
  } = useContext(AuthorMapDataContext);

  const [startingYear, endingYear] = statesData.dateRange;

  const entriesRef = useRef<HTMLUListElement>(null);

  const inclusionReasonFilter = convertValuesToFilters(inclusionReasons);

  const [settings, setSettings] = useState<AppearanceSettings>({
    removeEmptyYears: true,
    includeMajorEvents: false,
  });

  const filterArgs: Parameters<AuthorMapStores['getAll']>[0] = {
    yearRange,
    eventTypes,
    inclusionReasons: inclusionReasonFilter,
    search,
    groupId,
    formula,
  };

  if (settings.includeMajorEvents) {
    filterArgs.eventTypes = [...filterArgs.eventTypes, 'Major event'];
  }

  const timelineEvents = statesData.getTimelineEvents(filterArgs);

  const timelineEventsByYear = useMemo(() => {
    const map = new Map();

    timelineEvents.forEach((timelineEvent) => {
      const appendedEvents = [];

      if ('date' in timelineEvent) {
        appendedEvents.push(timelineEvent);
      } else if (timelineEvent.type !== 'Timeline') {
        // TODO: I'm honestly not sure what to do with the 'Timeline' type.
        const { startDate, endDate, notes, ...remainingEvent } = timelineEvent;

        appendedEvents.push(
          {
            ...remainingEvent,
            date: startDate,
            notes: `(Start) ${notes}`,
          },
          {
            ...remainingEvent,
            date: endDate,
            notes: `(End) ${notes}`,
          },
        );
      }

      appendedEvents.forEach((event) => {
        const year = Number(event.date.split('-').at(0)!);

        if (map.has(year)) {
          const existingEvents = map.get(year)!;
          map.set(
            year,
            existingEvents
              .concat(event)
              .sort(
                (a: { date: string }, b: { date: string }) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              ),
          );
        } else {
          map.set(year, [event]);
        }
      });
    });

    return sortMap(map, ([year]) => year);
  }, [timelineEvents]);

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
          events={events as any}
          onAuthorView={onAuthorView}
        />,
      );
    }

    return temp;
  }, [timelineEventsByYear, settings]);

  const initialEntriesShown = 10;

  const [entriesShown, setEntriesShown] = useState(initialEntriesShown);

  useEffect(() => {
    if (entriesRef.current) {
      const destroyInfiniteScroll = infiniteScroll(entriesRef.current, () => {
        setEntriesShown(
          Math.min(entriesShown + initialEntriesShown, eventElements.length),
        );
      });

      return () => {
        destroyInfiniteScroll();
      };
    }
  }, [entriesRef.current, setEntriesShown, entriesShown, eventElements.length]);

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
            {
              label: 'Show major events',
              value: 'includeMajorEvents',
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
