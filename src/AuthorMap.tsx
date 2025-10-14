import styles from './AuthorMap.module.css';
import commonStyles from './common.module.css';

import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  JSX,
} from 'react';

import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { MdClose } from 'react-icons/md';
import clsx from 'clsx';
import { Tooltip } from 'react-tooltip';

import { geography } from './consts/states.const';
import {
  Author,
  AuthorData,
  AuthorWithId,
  StateStore,
  USState,
} from './models';
import { createStores, transformAuthors } from './utils/stores';
import { getAuthorName } from './utils/names';
import { EditAuthorModal } from './components/EditAuthorModal/EditAuthorModal';
import { StateDrawer } from './components/StateDrawer/StateDrawer';

interface Geography {
  rsmKey: string;
  properties: {
    name: string;
  };
}

interface Props {
  authors: Array<Author>;

  className?: string;
  onAuthorAdded?: (author: Author) => void | Promise<void>;
  onAuthorUpdate?: (changedAuthor: Author) => void | Promise<void>;
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

interface MapPosition {
  coordinates: [number, number];
  zoom: number;
}

/**
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
  onAuthorUpdate,
}: Props): JSX.Element {
  const componentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  const [position, setPosition] = useState<MapPosition>({
    coordinates: [-97, 38],
    zoom: 1,
  });

  const [cachedAuthors, setCachedAuthors] = useState<Array<AuthorWithId>>(
    transformAuthors(authors),
  );

  const [highlightedState, setHighlightedState] = useState<USState | null>(
    null,
  );

  const [filters, setFilters] = useState<Filters>({});

  const [editingAuthor, setEditingAuthor] = useState<AuthorData | null>(null);

  // TODO: If it's a lot of data, do async? Return a promise?
  const [statesData, setStatesData] = useState(createStores(cachedAuthors));

  const updateAuthors = useCallback((newAuthors: Array<Author>) => {
    const newCachedAuthors = transformAuthors(newAuthors);
    setCachedAuthors(newCachedAuthors);
    setStatesData(createStores(newCachedAuthors));
  }, []);

  useEffect(() => {
    updateAuthors(authors);
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
  console.log('highlightedState', highlightedState);
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
        />
      )}
      <Tooltip id={tooltipId} place="right" noArrow />

      {editingAuthor && (
        <EditAuthorModal
          appElement={componentRef.current!}
          opened={Boolean(editingAuthor)}
          initialAuthor={editingAuthor}
          onClose={() => setEditingAuthor(null)}
          onSubmit={async (author) => {
            setLoading(true);

            try {
              await onAuthorUpdate?.(author);

              const authorIndex = cachedAuthors.findIndex(
                (cachedAuthor) => cachedAuthor.id === editingAuthor.id,
              );
              updateAuthors([
                ...cachedAuthors.slice(0, authorIndex),
                author,
                ...cachedAuthors.slice(authorIndex + 1),
              ]);
            } finally {
              setLoading(false);
            }

            setEditingAuthor(null);
          }}
        />
      )}
    </div>
  );
}
