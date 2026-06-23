import commonStyles from '../../common.module.css';
import styles from './AuthorMapView.module.css';

import {
  Fragment,
  JSX,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import clsx from 'clsx';

import { geography } from '../../consts/states.const';
import {
  AmericanLiteraryAward,
  Author,
  AuthorEventType,
  AuthorLocation,
  CityCoordinates,
  ClassicPublisher,
  USState,
} from '../../models';
import { StateDrawer } from '../StateDrawer/StateDrawer';
import { Tabs } from '../Tabs/Tabs';
import { AuthorMapDataContext } from '../../contexts';
import {
  convertValuesToFilters,
  InclusionReasonSelect,
  InclusionReasonValues,
} from '../InclusionReasonSelect/InclusionReasonSelect';

interface Geography {
  rsmKey: string;
  properties: {
    name: string;
  };
}

interface MapPosition {
  coordinates: [number, number];
  zoom: number;
}

interface Filters {
  eventType?: AuthorEventType;
}

interface Props {
  cityCoordinates: Array<CityCoordinates>;

  onAuthorEdit?: (author: Partial<Author>) => void;
  onAuthorView?: (author: Author) => void;
}

export function AuthorMapView({
  cityCoordinates,
  onAuthorEdit,
  onAuthorView,
}: Props): JSX.Element {
  const { data: statesData } = useContext(AuthorMapDataContext);

  const tooltipId = useMemo(() => 'state-labels-tooltip', []);

  const STATE_COLORS = useMemo(
    () => [
      '#F6E8C3',
      '#D8B365',
      '#5AB4AC',
      '#C7EAE5',
      '#F5F5F5',
      '#E0ECF4',
      '#A8DDB5',
      '#D9F0A3',
      '#FEE08B',
      '#F1B6DA',
    ],
    [],
  );

  const MARKER_COLORS = useMemo(
    () => [
      '#1E90FF',
      '#FF7A18',
      '#E6007A',
      '#A3FF12',
      '#00E5FF',
      '#FF2D2D',
      '#7C4DFF',
      '#FFD400',
    ],
    [],
  );

  const getColor = useCallback(
    (stateName: string) => {
      return STATE_COLORS[
        Math.abs(stateName.charCodeAt(0)) % STATE_COLORS.length
      ];
    },
    [STATE_COLORS],
  );

  const toCityID = useCallback(({ address, state }: AuthorLocation) => {
    if (address) {
      return `${state}-${address}`.replaceAll(/ /g, '-');
    } else {
      return null;
    }
  }, []);

  const [position, setPosition] = useState<MapPosition>({
    coordinates: [-97, 38],
    zoom: 1,
  });

  const [highlightedState, setHighlightedState] = useState<USState | null>(
    null,
  );

  const [highlightedCity, setHighlightedCity] =
    useState<Required<AuthorLocation> | null>(null);

  const [filters, setFilters] = useState<Filters>({
    eventType: AuthorEventType.BIRTHS,
  });

  const [inclusionReasons, setInclusionReasons] =
    useState<InclusionReasonValues>({
      poetLaureates: true,
      publishers: {
        checked: true,
        collapsed: true,
        specific: {
          [ClassicPublisher.DALKEY]: true,
          [ClassicPublisher.LIBRARY_OF_AMERICA]: true,
          [ClassicPublisher.NORTON]: true,
          [ClassicPublisher.NYRB]: true,
          [ClassicPublisher.PENGUIN_CLASSIC]: true,
        },
      },
      awards: {
        checked: true,
        collapsed: true,
        specific: {
          [AmericanLiteraryAward.NATIONAL_BOOK_FICTION]: true,
          [AmericanLiteraryAward.NATIONAL_BOOK_POETRY]: true,
          [AmericanLiteraryAward.NOBEL_PRIZE_IN_LITERATURE]: true,
          [AmericanLiteraryAward.PULITZER_FICTION]: true,
          [AmericanLiteraryAward.PULITZER_POETRY]: true,
        },
      },
      personal: false,
    });

  const inclusionReasonFilter = convertValuesToFilters(inclusionReasons);

  const renderedCityCoordinates: Array<
    CityCoordinates & { marker: JSX.Element }
  > = useMemo(() => {
    return cityCoordinates.reduce(
      (acc, cityCoordinate, i) => {
        const { location, coordinates } = cityCoordinate;
        const numAuthors = statesData.getAuthors(location.state, {
          eventType: filters.eventType,
          address: location.address,
          inclusionReasons: inclusionReasonFilter,
        }).length;

        if (numAuthors > 0) {
          const marker = (
            <Marker
              key={toCityID(location)}
              coordinates={coordinates}
              data-tooltip-id={tooltipId}
              data-tooltip-content={`${location.address}, ${location.state} (${numAuthors})`}
              onClick={() => {
                setHighlightedCity(location);
                setHighlightedState(null);
              }}
            >
              <circle
                r={1.5}
                fill={MARKER_COLORS[i % MARKER_COLORS.length]}
                stroke="black"
                strokeWidth={0.5}
              />
            </Marker>
          );

          return acc.concat({
            ...cityCoordinate,
            marker,
          });
        } else {
          return acc;
        }
      },
      [] as Array<CityCoordinates & { marker: JSX.Element }>,
    );
  }, [
    MARKER_COLORS,
    filters,
    cityCoordinates,
    tooltipId,
    inclusionReasons,
    toCityID,
    setHighlightedCity,
    setHighlightedState,
  ]);

  const stateDrawerElement = useMemo(() => {
    let title: string | undefined, authors: Array<Author> | undefined;

    if (highlightedState) {
      title = highlightedState;
      authors = statesData.getAuthors(highlightedState, {
        eventType: filters.eventType,
        inclusionReasons: inclusionReasonFilter,
      });
    } else if (highlightedCity) {
      title = `${highlightedCity.address}, ${highlightedCity.state}`;
      authors = statesData.getAuthors(highlightedCity.state, {
        eventType: filters.eventType,
        address: highlightedCity.address,
        inclusionReasons: inclusionReasonFilter,
      });
    }

    if (title && authors) {
      return (
        <StateDrawer
          title={title}
          authors={authors}
          eventType={filters.eventType}
          onClose={() => {
            setHighlightedState(null);
            setHighlightedCity(null);
          }}
          onEdit={onAuthorEdit}
          onView={onAuthorView}
          onAddAuthor={() => {
            onAuthorEdit?.({
              authorFirstName: '',
              authorLastName: '',
              authorFullName: '',
              portrait: {
                src: '',
              },
            });
          }}
        />
      );
    } else {
      return <></>;
    }
  }, [
    statesData,
    highlightedState,
    highlightedCity,
    filters,
    setHighlightedState,
    setHighlightedCity,
    onAuthorEdit,
  ]);

  return (
    <>
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
                  const stateName = geography.properties.name as USState;

                  return (
                    <Fragment key={geography.rsmKey}>
                      <Geography
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={`${stateName} (${statesData.getAuthors(stateName, { eventType: filters.eventType, inclusionReasons: inclusionReasonFilter }).length})`}
                        geography={geography}
                        style={{
                          default: {
                            fill: getColor(stateName), // white fill
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
                          setHighlightedCity(null);
                        }}
                      />
                    </Fragment>
                  );
                });
            }}
          </Geographies>
          {renderedCityCoordinates.map(({ marker }) => marker)}
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip
        id={tooltipId}
        className={styles.authorMapViewTooltip}
        place="right"
        noArrow
      />
      {stateDrawerElement}
      <div
        className={clsx(
          commonStyles.floatingAction,
          styles.authorMapViewFilterPane,
        )}
      >
        <Tabs<AuthorEventType>
          className={styles.authorMapEventType}
          highlightedValue={filters.eventType}
          values={Object.values(AuthorEventType).map((value) => ({
            value,
            label: value,
          }))}
          onChange={(value) => {
            if (value) {
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
        />

        <InclusionReasonSelect
          selected={inclusionReasons}
          onSelectedChange={setInclusionReasons}
        />
      </div>
    </>
  );
}
