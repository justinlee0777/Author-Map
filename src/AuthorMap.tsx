import styles from './AuthorMap.module.css';

import { useState, type JSX } from 'react';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';

import { geography } from './consts/states.const';
import { Author, stateToTimezoneMap, USState } from './models';
import clsx from 'clsx';

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
  bornAuthors: Array<Author>;
}

export function AuthorMap({ authors, className }: Props): JSX.Element {
  const [highlightedState, setHighlightedState] = useState<StateData | null>(
    null,
  );

  /*
  // Note: Do the Author's need an ID? First name and last name are unreliable. The object reference is enough, yes?
  const [highlightedAuthor, setHighlightedAuthor] = useState<Author | null>(null);
  */

  return (
    <div className={clsx(styles.componentContainer, className)}>
      <div className={styles.mapContainer}>
        <ComposableMap projection="geoAlbersUsa">
          <Geographies geography={geography}>
            {(args) => {
              const geographies = args.geographies as Array<Geography>;

              return geographies.map((geography) => {
                const bornAuthors = authors.filter((author) => {
                  const birthEvent = author.timeline.at(0);

                  if (birthEvent) {
                    return (
                      birthEvent.location.state === geography.properties.name
                    );
                  } else {
                    return false;
                  }
                });

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

                      console.log('geo', geography);

                      setHighlightedState({
                        name: countyName as USState,
                        geography,
                        bornAuthors,
                      });
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ComposableMap>
      </div>
      {highlightedState && (
        <div className={clsx(styles.sideDrawer, styles.sideDrawerUSState)}>
          <h3>{highlightedState.name}</h3>
          <h4>Births</h4>
          {highlightedState.bornAuthors.map((author, i) => {
            const timeZone = stateToTimezoneMap.get(highlightedState.name)!;

            const birthDate = fromZonedTime(author.birthDate, timeZone);
            console.log('timeZone', timeZone, birthDate, author.birthDate);
            const formattedBirthString = format(birthDate, 'LLLL dd, y', {
              timeZone,
            });

            const authorName =
              author.authorFullName ??
              `${author.authorFirstName} ${author.authorLastName}`;

            return (
              <div key={i} className={styles.authorRow}>
                {author.portrait && <img {...author.portrait} />}
                <div className={styles.authorDetails}>
                  <p>{authorName}</p>
                  <p>{formattedBirthString}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
