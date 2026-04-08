import commonStyles from '../../common.module.css';
import styles from './AuthorMapView.module.css';

import { Fragment, JSX, useCallback, useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';

import { geography } from '../../consts/states.const';
import {
  Author,
  AuthorEventType,
  AuthorLocation,
  CityCoordinates,
  StateStore,
  USState,
} from '../../models';
import { StateDrawer } from '../StateDrawer/StateDrawer';
import { Tabs } from '../Tabs/Tabs';
import clsx from 'clsx';
import { AuthorStores } from '../../utils/stores';

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
  statesData: AuthorStores;
  cityCoordinates: Array<CityCoordinates>;

  onAuthorEdit?: (author: Partial<Author>) => void;
}

export function AuthorMapView({
  statesData,
  cityCoordinates,
  onAuthorEdit,
}: Props): JSX.Element {
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

  const renderedCityCoordinates: Array<
    CityCoordinates & { marker: JSX.Element }
  > = useMemo(() => {
    return cityCoordinates.reduce(
      (acc, cityCoordinate, i) => {
        const { location, coordinates } = cityCoordinate;
        const numAuthors = statesData.getAuthors(
          location.state,
          filters.eventType,
          location.address,
        ).length;

        if (numAuthors > 0) {
          const marker = (
            <Marker
              key={toCityID(location)}
              coordinates={coordinates}
              data-tooltip-id={tooltipId}
              data-tooltip-content={`${location.address}, ${location.state} (${numAuthors})`}
              onClick={() => setHighlightedCity(location)}
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
    toCityID,
    setHighlightedCity,
  ]);

  const stateDrawerElement = useMemo(() => {
    let title: string | undefined,
      authors: Array<Author> | undefined,
      state: USState | undefined;

    if (highlightedState) {
      title = highlightedState;
      authors = statesData.getAuthors(highlightedState);
      state = highlightedState;
    } else if (highlightedCity) {
      title = `${highlightedCity.address}, ${highlightedCity.state}`;
      authors = statesData.getAuthors(
        highlightedCity.state,
        filters.eventType,
        highlightedCity.address,
      );
      state = highlightedCity.state;
    }

    if (title && authors) {
      return (
        <StateDrawer
          title={title}
          authors={authors}
          eventType={filters.eventType}
          showContext={!filters.eventType}
          onClose={() => {
            setHighlightedState(null);
            setHighlightedCity(null);
          }}
          onEdit={onAuthorEdit}
          onAddAuthor={() => {
            onAuthorEdit?.({
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
                  state,
                },
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
                        data-tooltip-content={`${stateName} (${statesData.getAuthors(stateName, filters.eventType).length})`}
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
      <Tabs<AuthorEventType>
        className={clsx(
          commonStyles.floatingAction,
          styles.authorMapViewFilterPane,
        )}
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
    </>
  );
}
