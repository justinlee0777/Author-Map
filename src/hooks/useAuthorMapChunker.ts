import { useContext, useEffect, useState } from 'react';
import chunk from 'lodash-es/chunk';

import type { AuthorStoreFilters } from '../utils/stores';
import { AuthorMapDataContext } from '../contexts';
import { Author, CityCoordinates, USState } from '../models';

type StateChunk = {
  authors: Array<Author>;
  addresses: {
    [address: string]: Array<Author>;
  };
};

type AuthorMapChunks = {
  [usState in USState]: StateChunk;
};

/**
 * For the Author Map view, chunks the JS work for getting the authors per state based on the filters.
 */
export function useAuthorMapChunker(
  cityCoordinates: Array<CityCoordinates>,
  args: Omit<AuthorStoreFilters, 'state'>,
): AuthorMapChunks {
  const { data } = useContext(AuthorMapDataContext);

  const [chunks, setChunks] = useState<AuthorMapChunks>(() => {
    return Object.values(USState).reduce(
      (acc: AuthorMapChunks, state: USState) => {
        const entry: StateChunk = {
          authors: [],
          addresses: {},
        };

        return {
          ...acc,
          [state]: entry,
        };
      },
      {} as AuthorMapChunks,
    );
  });

  useEffect(() => {
    (async () => {
      const queue = [...Object.values(USState), ...cityCoordinates];

      const chunks = chunk(queue, 3);

      for (const chunk of chunks) {
        setChunks((chunks) => {
          const clonedChunks = structuredClone(chunks);

          for (const location of chunk) {
            if (typeof location === 'string') {
              clonedChunks[location].authors = data.getAll({
                ...args,
                state: location,
              });
            } else {
              const { state, address } = location.location;

              clonedChunks[state].addresses[address] = data.getAll({
                ...args,
                state,
                address,
              });
            }
          }

          return clonedChunks;
        });

        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    })();
  }, [args, cityCoordinates, data, setChunks]);

  return chunks;
}
