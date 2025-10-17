import {
  Author,
  AuthorData,
  MilestoneEvent,
  StateStore,
  TimelineEvent,
  USState,
} from '../models';
import { formatDate } from './dates';

export class AuthorStores {
  private map: Map<USState, StateStore>;
  private internalRegistry: Set<Author['id']>;

  constructor(authors: Array<Author>) {
    this.map = new Map<USState, StateStore>([
      ...Object.values(USState).map(
        (stateName) =>
          [
            stateName,
            { bornAuthors: [], deceasedAuthors: [], residingAuthors: [] },
          ] as [USState, StateStore],
      ),
    ]);

    this.internalRegistry = new Set();

    for (const author of authors) {
      this.add(author);
    }
  }

  get(state: USState): StateStore {
    return this.map.get(state)!;
  }

  add(author: Author): void {
    const { map } = this;

    let fullTimeline: Array<MilestoneEvent | TimelineEvent> = [
      ...author.timeline,
    ];

    // Birth state
    const birthEvent = author.birthDate;

    const state = birthEvent.location.state;

    if (state) {
      const store = map.get(state)!;

      const birthEventDate = new Date(birthEvent.date);

      const succeedingIndex = store.bornAuthors.findIndex((author) => {
        return birthEventDate < new Date(author.birthDate.date);
      });

      const finalAuthor: AuthorData = {
        ...author,
        events: [
          {
            date: formatDate(state, birthEvent.date),
            context: 'Birth',
            address: birthEvent.location.address,
          },
        ],
      };

      if (succeedingIndex === -1) {
        store.bornAuthors.push(finalAuthor);
      } else {
        store.bornAuthors.splice(succeedingIndex, 0, finalAuthor);
      }
    }

    fullTimeline = [{ ...birthEvent, notes: 'Birth' }, ...fullTimeline];

    // Death state
    const deathEvent = author.deathDate;

    if (deathEvent) {
      const state = deathEvent.location.state;

      if (state) {
        const store = map.get(state)!;

        const deathEventDate = new Date(deathEvent.date);

        const succeedingIndex = store.deceasedAuthors.findIndex((author) => {
          return deathEventDate < new Date(author.deathDate!.date);
        });

        const finalAuthor: AuthorData = {
          ...author,
          events: [
            {
              date: formatDate(state, deathEvent.date),
              context: 'Death',
              address: deathEvent.location.address,
            },
          ],
        };

        if (succeedingIndex === -1) {
          store.deceasedAuthors.push(finalAuthor);
        } else {
          store.deceasedAuthors.splice(succeedingIndex, 0, finalAuthor);
        }
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

    this.internalRegistry.add(author.id);
  }

  update(author: Author): void {
    this.remove(author.id);

    this.add(author);
  }

  remove(authorId: Author['id']) {
    const { map } = this;

    if (this.internalRegistry.has(authorId)) {
      const keys: Array<keyof StateStore> = [
        'bornAuthors',
        'deceasedAuthors',
        'residingAuthors',
      ];

      for (const stateStore of map.values()) {
        keys.forEach((key) => {
          stateStore[key] = stateStore[key].filter(
            (existingAuthor) => existingAuthor.id !== authorId,
          );
        });
      }

      this.internalRegistry.delete(authorId);
    }
  }
}

interface KeyGenerator {
  getKey(value: string | Symbol): string;
}

/**
 * Inspired by https://github.com/facebook/react/issues/11996 .
 */
export function createKeyGenerator(): KeyGenerator {
  const keys = new WeakMap<any, string>();

  let key = 0;

  return {
    getKey: (value) => {
      switch (typeof value) {
        case 'string':
          return value;
        case 'symbol':
          if (keys.has(value)) {
            return keys.get(value)!;
          } else {
            const k = key++;

            const finalKey = k.toString();

            keys.set(value, finalKey);
            return finalKey;
          }
        default:
          throw new Error(
            `Value '${value}' is neither a string or symbol. Cannot generate key.`,
          );
      }
    },
  };
}
