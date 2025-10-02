import {
  Author,
  AuthorData,
  AuthorWithId,
  MilestoneEvent,
  StateStore,
  TimelineEvent,
  USState,
} from '../models';
import { formatDate } from './dates';
import { getAuthorName } from './names';

export function transformAuthors(authors: Array<Author>): Array<AuthorWithId> {
  return authors.map((author) => ({
    ...author,
    id: Symbol(`ID for author ${getAuthorName(author)}`),
  }));
}

export function createStores(
  authors: Array<AuthorWithId>,
): Map<USState, StateStore> {
  const map = new Map<USState, StateStore>([
    ...Object.values(USState).map(
      (stateName) =>
        [
          stateName,
          { bornAuthors: [], deceasedAuthors: [], residingAuthors: [] },
        ] as [USState, StateStore],
    ),
  ]);

  for (const author of authors) {
    let fullTimeline: Array<MilestoneEvent | TimelineEvent> = [
      ...author.timeline,
    ];

    // Birth state
    const birthEvent = author.birthDate;

    const state = birthEvent.location.state;

    if (state) {
      const store = map.get(state)!;

      store.bornAuthors.push({
        ...author,
        events: [
          {
            date: formatDate(state, birthEvent.date),
            context: 'Birth',
            address: birthEvent.location.address,
          },
        ],
      });
    }

    fullTimeline = [{ ...birthEvent, notes: 'Birth' }, ...fullTimeline];

    // Death state
    const deathEvent = author.deathDate;

    if (deathEvent) {
      const state = deathEvent.location.state;

      if (state) {
        const store = map.get(state)!;

        store.deceasedAuthors.push({
          ...author,
          events: [
            {
              date: formatDate(state, deathEvent.date),
              context: 'Death',
              address: deathEvent.location.address,
            },
          ],
        });
      }

      fullTimeline = [...fullTimeline, { ...deathEvent, notes: 'Death' }];
    }

    // Residing states
    fullTimeline.forEach((event) => {
      const state = event.location.state;
      if (state) {
        const store = map.get(state)!;

        const addedAuthor = store.residingAuthors.find(
          (residingAuthor) => residingAuthor.id === author.id,
        );

        let formattedDateRange: string;

        if ('date' in event) {
          formattedDateRange = formatDate(state, event.date);
        } else {
          formattedDateRange = `${formatDate(state, event.startDate)} - ${formatDate(state, event.endDate)}`;
        }

        if (addedAuthor) {
          addedAuthor.events = addedAuthor.events.concat({
            date: formattedDateRange,
            context: event.notes ?? '',
            address: event.location.address,
          });
        } else {
          store.residingAuthors.push({
            ...author,
            events: [
              {
                date: formattedDateRange,
                context: event.notes ?? '',
                address: event.location.address,
              },
            ],
          });
        }
      }
    });
  }

  return map;
}
