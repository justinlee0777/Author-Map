import { type JSX } from 'react';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { geography } from './consts/states.const';

interface Geography {
  rsmKey: string;
  properties: {
    name: string;
  };
}

export function AuthorMap(): JSX.Element {
  return (
    <ComposableMap projection="geoAlbersUsa">
      <Geographies geography={geography}>
        {(args) => {
          const geographies = args.geographies as Array<Geography>;

          return geographies.map((geography) => (
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
                // You can map these to full names if needed

                console.log('geo', geography);
              }}
            />
          ));
        }}
      </Geographies>
    </ComposableMap>
  );
}
