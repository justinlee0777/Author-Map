import styles from './AuthorMap.module.css';

import { useMemo, useState, type JSX } from 'react';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { format, fromZonedTime } from 'date-fns-tz';
import { MdAdd, MdClose, MdHorizontalRule } from 'react-icons/md';

import { geography } from './consts/states.const';
import { Author, StateStore, stateToTimezoneMap, USState } from './models';
import clsx from 'clsx';
import { createStores } from './utils/stores';
import { formatDate } from './utils/dates';

interface Geography {
  rsmKey: string;
  properties: {
    name: string;
  };
}

interface Props {
  authors: Array<Author>;

  className?: string;
}

interface StateData {
  name: USState;
  geography: Geography;
}

enum EventType {
  BIRTHS = 'Births',
  DEATHS = 'Deaths',
}

interface Filters {
  eventType?: EventType;
}

/**
 * TODO: Sort on startup? Async? Will it be a lot of data? Hmm.
 * TODO: Might want to break this up into different components.
 */
export function AuthorMap({ authors, className }: Props): JSX.Element {
  const [highlightedState, setHighlightedState] = useState<StateData | null>(
    null,
  );

  const [magnification, setMagnification] = useState<number>(1);

  const [filters, setFilters] = useState<Filters>({});

  const [lowerBound, upperBound, magIncrement] = useMemo(() => {
    return [0.2, 2, 0.2];
  }, [magnification]);

  // TODO: If it's a lot of data, do async? Return a promise?
  const statesData = useMemo(() => createStores(authors), [authors]);

  /*
  // Note: Do the Author's need an ID? First name and last name are unreliable. The object reference is enough, yes?
  const [highlightedAuthor, setHighlightedAuthor] = useState<Author | null>(null);
  */

  const filterPaneButtons = Object.values(EventType).map((value) => {
    return (
      <button
        key={value}
        className={clsx(styles.button, {
          [styles.highlightedFilter]: filters.eventType === value,
        })}
        onClick={() => {
          setFilters({
            ...filters,
            eventType: value,
          });
        }}
      >
        {value}
      </button>
    );
  });

  let statesDataKey: keyof StateStore | undefined;
  // TODO: If no filter is presented, find every author that had ever been in the state
  switch (filters.eventType) {
    case EventType.BIRTHS:
      statesDataKey = 'bornAuthors';
      break;
    case EventType.DEATHS:
      statesDataKey = 'deceasedAuthors';
      break;
    default:
      statesDataKey = 'residingAuthors';
      break;
  }

  return (
    <div className={clsx(styles.componentContainer, className)}>
      <div
        className={styles.mapContainer}
        style={{ transform: `scale(${magnification})` }}
      >
        <ComposableMap projection="geoAlbersUsa">
          <Geographies geography={geography}>
            {(args) => {
              const geographies = args.geographies as Array<Geography>;

              return geographies.map((geography) => {
                return (
                  <Geography
                    key={geography.rsmKey}
                    geography={geography}
                    style={{
                      default: {
                        fill: '#FFFFFF', // white fill
                        stroke: '#000000', // black border
                        strokeWidth: 0.5, // border thickness
                        outline: 'none',
                      },
                      hover: {
                        fill: '#F0F0F0', // light gray on hover
                        stroke: '#000000',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      pressed: {
                        fill: '#D0D0D0', // darker gray when clicked
                        stroke: '#000000',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                    }}
                    onClick={() => {
                      const countyName = geography.properties.name;

                      setHighlightedState({
                        name: countyName as USState,
                        geography,
                      });
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ComposableMap>
      </div>
      <div
        className={clsx(styles.floatingAction, styles.tabs, styles.filterPane)}
      >
        {filterPaneButtons}
      </div>
      <input
        className={clsx(styles.floatingAction, styles.magnificationSlider)}
        type="range"
        min={lowerBound}
        max={upperBound}
        step={magIncrement}
        value={magnification}
        onChange={(event) => {
          setMagnification(Number(event.currentTarget.value));
        }}
      />
      {highlightedState && (
        <div className={clsx(styles.sideDrawer, styles.sideDrawerUSState)}>
          <button
            className={clsx(styles.button, styles.closeSideDrawer)}
            onClick={() => setHighlightedState(null)}
          >
            <MdClose />
          </button>
          <h3>{highlightedState.name}</h3>
          {statesDataKey &&
            statesData
              .get(highlightedState.name)!
              [statesDataKey].map((author, i) => {
                let dateString: string;

                switch (filters.eventType) {
                  case EventType.BIRTHS:
                    dateString = formatDate(
                      highlightedState.name,
                      author.birthDate,
                    );
                    break;
                  case EventType.DEATHS:
                    dateString = formatDate(
                      highlightedState.name,
                      author.deathDate,
                    );
                    break;
                  default:
                    dateString = `${formatDate(highlightedState.name, author.birthDate)} - ${formatDate(highlightedState.name, author.deathDate)}`;
                    break;
                }

                const authorName =
                  author.authorFullName ??
                  `${author.authorFirstName} ${author.authorLastName}`;

                return (
                  <div key={i} className={styles.authorRow}>
                    {author.portrait && <img {...author.portrait} />}
                    <div className={styles.authorDetails}>
                      <p>{authorName}</p>
                      <p>{dateString}</p>
                    </div>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
}
