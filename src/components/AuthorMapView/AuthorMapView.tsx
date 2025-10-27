import commonStyles from '../../common.module.css';
import styles from './AuthorMapView.module.css';

import { Fragment, JSX, useCallback, useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

import { geography } from '../../consts/states.const';
import { Author, AuthorEventType, StateStore, USState } from '../../models';
import { Tooltip } from 'react-tooltip';
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

  onAuthorEdit?: (author: Partial<Author>) => void;
}

export function AuthorMapView({
  statesData,
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

  const getColor = useCallback(
    (stateName: string) => {
      return STATE_COLORS[
        Math.abs(stateName.charCodeAt(0)) % STATE_COLORS.length
      ];
    },
    [STATE_COLORS],
  );

  const [position, setPosition] = useState<MapPosition>({
    coordinates: [-97, 38],
    zoom: 1,
  });

  const [highlightedState, setHighlightedState] = useState<USState | null>(
    null,
  );

  const [filters, setFilters] = useState<Filters>({});

  let statesDataKey: keyof StateStore;

  switch (filters.eventType) {
    case AuthorEventType.BIRTHS:
      statesDataKey = 'bornAuthors';
      break;
    case AuthorEventType.DEATHS:
      statesDataKey = 'deceasedAuthors';
      break;
    default:
      statesDataKey = 'residingAuthors';
      break;
  }

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
                  const stateName = geography.properties.name;

                  return (
                    <Fragment key={geography.rsmKey}>
                      <Geography
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={stateName}
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
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip
        id={tooltipId}
        className={styles.authorMapViewTooltip}
        place="right"
        noArrow
      />
      {highlightedState && (
        <StateDrawer
          usState={highlightedState}
          statesData={statesData}
          statesDataKey={statesDataKey}
          eventType={filters.eventType}
          showContext={!filters.eventType}
          onClose={() => setHighlightedState(null)}
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
                  state: highlightedState,
                },
              },
            });
          }}
        />
      )}
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
