import json from './data/author-map-data.json';

import { useEffect, useState } from 'react';

import {
  Author,
  AuthorGroup,
  AuthorMapProps,
  AuthorTimelineEvent,
  CityCoordinates,
} from './src/models';
import {
  groups as sampleGroups,
  authors as sampleAuthors,
  timeline as sampleTimeline,
  cityCoordinates as sampleCityCoordinates,
} from './sample-data';

interface StaticConfig {
  type: 'static';
}

interface APIConfig {
  url: string;
  type: 'API';
}

interface JSONConfig {
  type: 'JSON';
}

type Config = StaticConfig | APIConfig | JSONConfig;

export function useDemoData(config: Config): {
  loading: boolean;
  authors: Array<Author>;
  groups: Array<AuthorGroup>;
  timeline: Array<AuthorTimelineEvent>;
  cityCoordinates: Array<CityCoordinates>;

  entriesIntoUnion?: AuthorMapProps['entriesIntoUnion'];
  stateCensus?: AuthorMapProps['stateCensus'];
} {
  const [groups, setGroups] = useState<Array<AuthorGroup>>(sampleGroups);

  const [authors, setAuthors] = useState<Array<Author>>(sampleAuthors);

  const [timeline, setTimeline] =
    useState<Array<AuthorTimelineEvent>>(sampleTimeline);

  const [cityCoordinates, setCityCoordinates] = useState<
    Array<CityCoordinates>
  >(sampleCityCoordinates);

  const [entriesIntoUnion, setEntriesIntoUnion] = useState<
    AuthorMapProps['entriesIntoUnion'] | undefined
  >();

  const [stateCensus, setStateCensus] = useState<
    AuthorMapProps['stateCensus'] | undefined
  >();

  const [loading, setLoading] = useState(config.type !== 'static');

  useEffect(() => {
    if (loading) {
      switch (config.type) {
        case 'API':
          (async () => {
            const [{ authors, groups, timeline, coordinates }] =
              await Promise.all([
                fetch(config.url).then((response) => response.json()),
              ]);

            setAuthors(authors);
            setGroups(groups);
            setTimeline(timeline);
            setCityCoordinates(coordinates);

            setLoading(false);
          })();
          break;
        case 'JSON':
          (async () => {
            const {
              authors: jsonAuthors,
              birthEvents,
              deathEvents,
              milestoneEvents,
              timelineEvents,
              cityCoordinates,
              majorEvents,
              stateCensus,
              entriesIntoUnion,
              authorGroups,
            } = json;

            setAuthors(jsonAuthors as any);
            setGroups(authorGroups);
            setTimeline([
              ...birthEvents,
              ...deathEvents,
              ...milestoneEvents,
              ...timelineEvents,
              ...majorEvents,
            ] as any);
            setCityCoordinates(
              cityCoordinates.filter(
                (coordinate) => coordinate.location.state !== 'Puerto Rico',
              ) as Array<CityCoordinates>,
            );
            setStateCensus(stateCensus);
            setEntriesIntoUnion(entriesIntoUnion);

            setLoading(false);
          })();
          break;
      }
    }
  }, [
    loading,
    config,
    setAuthors,
    setGroups,
    setTimeline,
    setCityCoordinates,
    setLoading,
  ]);

  return {
    loading,
    groups,
    authors,
    timeline,
    cityCoordinates,
    stateCensus,
    entriesIntoUnion,
  };
}
