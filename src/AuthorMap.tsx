import styles from './AuthorMap.module.css';
import commonStyles from './common.module.css';

import { Fragment, useMemo, useRef, useState, JSX } from 'react';

import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import clsx from 'clsx';
import { Tooltip } from 'react-tooltip';

import { geography } from './consts/states.const';
import { Author, StateStore, USState } from './models';
import { EditAuthorModal } from './components/EditAuthorModal/EditAuthorModal';
import { StateDrawer } from './components/StateDrawer/StateDrawer';
import { getAuthorName } from './utils/names';
import { AuthorStores } from './utils/stores';

interface Geography {
  rsmKey: string;
  properties: {
    name: string;
  };
}

interface Props {
  authors: Array<Author>;

  className?: string;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   */
  syncAuthorAdded?: (author: Author) => void | Promise<void>;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   */
  syncAuthorUpdate?: (changedAuthor: Author) => void | Promise<void>;
}

enum EventType {
  BIRTHS = 'Births',
  DEATHS = 'Deaths',
}

interface Filters {
  eventType?: EventType;
}

interface MapPosition {
  coordinates: [number, number];
  zoom: number;
}

/**
 * This is not pure. This will internally update authors.
 * This is up for debate. The component cannot know what changes are made to the 'authors' prop. Therefore, for any change,
 * every author needs to be scanned and the stores need to be updated. This can be costly for performance.
 * TODO: There is a strategy to block data change if the external datastore fails, but there also needs to be a fallback strategy
 * if the client prefers to update now and correct later.
 *
 *
 * TODO: Groups? ex. Nobel Prize winners? Genre?
 * TODO: Discussion system?
 * TODO: Full timeline
 * TODO: Show who is in a state on hover? Need to see some data early
 * TODO: Sort on startup? Async? Will it be a lot of data? Hmm.
 * TODO: Might want to break this up into different components.
 * TODO: Editing + export JSON
 * TODO: Overall timeline
 * TODO: Import? JSON validate?
 * TODO: Links to bibliography
 * TODO: Nicer version of timeline
 * TODO: Need to reorder timeline
 * TODO: Accept a stream?
 */
export function AuthorMap({
  authors,
  className,
  syncAuthorAdded,
  syncAuthorUpdate,
}: Props): JSX.Element {
  const componentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  const [position, setPosition] = useState<MapPosition>({
    coordinates: [-97, 38],
    zoom: 1,
  });

  const [highlightedState, setHighlightedState] = useState<USState | null>(
    null,
  );

  const [filters, setFilters] = useState<Filters>({});

  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(
    null,
  );

  // TODO: If it's a lot of data, do async? Return a promise?
  const statesData = useMemo(() => {
    return new AuthorStores(authors);
  }, [authors]);

  const tooltipId = useMemo(() => 'state-labels-tooltip', []);

  const filterPaneButtons = Object.values(EventType).map((value) => {
    return (
      <button
        key={value}
        className={clsx(commonStyles.button, {
          [styles.highlightedFilter]: filters.eventType === value,
        })}
        onClick={() => {
          if (filters.eventType !== value) {
            setFilters({
              ...filters,
              eventType: value,
            });
          } else {
            setFilters({
              ...filters,
              eventType: undefined,
            });
          }
        }}
      >
        {value}
      </button>
    );
  });

  let statesDataKey: keyof StateStore;

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
    <div
      className={clsx(styles.componentContainer, className)}
      ref={componentRef}
    >
      <div className={styles.mapContainer}>
        <ComposableMap projection="geoAlbersUsa">
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={setPosition}
            minZoom={0.8}
            maxZoom={8}
          >
            <Geographies geography={geography}>
              {(args) => {
                const geographies = args.geographies as Array<Geography>;

                const validAreas = new Set(Object.values(USState));

                return geographies
                  .filter((geography) =>
                    validAreas.has(geography.properties.name as USState),
                  )
                  .map((geography) => {
                    const stateName = geography.properties.name;

                    return (
                      <Fragment key={geography.rsmKey}>
                        <Geography
                          data-tooltip-id={tooltipId}
                          data-tooltip-content={geography.properties.name}
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
                            setHighlightedState(stateName as USState);
                          }}
                        />
                      </Fragment>
                    );
                  });
              }}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div
        className={clsx(
          commonStyles.floatingAction,
          styles.tabs,
          styles.filterPane,
        )}
      >
        {filterPaneButtons}
      </div>
      {highlightedState && (
        <StateDrawer
          usState={highlightedState}
          statesData={statesData}
          statesDataKey={statesDataKey}
          showContext={!filters.eventType}
          onClose={() => setHighlightedState(null)}
          onEdit={setEditingAuthor}
          onAddAuthor={() => {
            setEditingAuthor({
              authorFirstName: '',
              authorLastName: '',
              authorFullName: '',
              timeline: [],
              portrait: {
                src: '',
              },
              birthDate: {
                date: '',
                location: {
                  address: '',
                  state: highlightedState,
                },
              },
              deathDate: {
                date: '',
                location: {
                  address: '',
                  state: highlightedState,
                },
              },
            });
          }}
        />
      )}
      <Tooltip
        id={tooltipId}
        className={styles.authorMapTooltip}
        place="right"
        noArrow
      />

      {editingAuthor && (
        <EditAuthorModal
          appElement={componentRef.current!}
          opened={Boolean(editingAuthor)}
          initialAuthor={editingAuthor}
          onClose={() => setEditingAuthor(null)}
          onSubmit={async (author) => {
            setLoading(true);

            const updating = Boolean(author.id);

            try {
              if (updating) {
                await syncAuthorUpdate?.(author);
                statesData.update(author);
              } else {
                await syncAuthorAdded?.(author);

                statesData.add(author);
              }

              setEditingAuthor(null);
            } catch (error) {
              console.error(
                `Author could not be ${updating ? 'updated' : 'added'}.`,
                error,
              );
              alert(
                `Author could not be ${updating ? 'updated' : 'added'}. Please try again.`,
              );
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}
