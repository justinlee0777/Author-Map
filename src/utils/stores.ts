import {
  Author,
  MilestoneEvent,
  StateStore,
  TimelineEvent,
  USState,
} from '../models';
import { getAuthorName } from './names';

export interface AuthorSort {
  name?: boolean;
  birth?: boolean;
  death?: boolean;
}

export class AuthorStores {
  private map: Map<USState, StateStore>;
  private internalRegistry: Map<Author['id'], Author>;

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

    this.internalRegistry = new Map();

    for (const author of authors) {
      this.add(author);
    }
  }

  getAll(sort: AuthorSort = { name: true }): Array<Author> {
    const authors = Array.from(this.internalRegistry.values());

    if (sort.name) {
      return authors.sort((a, b) =>
        getAuthorName(a).localeCompare(getAuthorName(b)),
      );
    } else if (sort.birth) {
      return authors.sort(
        (a, b) =>
          new Date(a.birthDate.date).valueOf() -
          new Date(b.birthDate.date).valueOf(),
      );
    } else if (sort.death) {
      return authors.sort((a, b) => {
        if (!(a.deathDate || b.deathDate)) {
          return 0;
        } else if (!a.deathDate) {
          return 1;
        } else if (!b.deathDate) {
          return -1;
        } else {
          return (
            new Date(a.deathDate.date).valueOf() -
            new Date(b.deathDate.date).valueOf()
          );
        }
      });
    } else {
      return authors;
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

      if (succeedingIndex === -1) {
        store.bornAuthors.push(author);
      } else {
        store.bornAuthors.splice(succeedingIndex, 0, author);
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

        if (succeedingIndex === -1) {
          store.deceasedAuthors.push(author);
        } else {
          store.deceasedAuthors.splice(succeedingIndex, 0, author);
        }
      }

      fullTimeline = [...fullTimeline, { ...deathEvent, notes: 'Death' }];
    }

    // Residing states
    fullTimeline.forEach((event) => {
      const state = event.location.state;
      if (state) {
        const store = map.get(state)!;

        if (
          !store.residingAuthors.find(
            (residingAuthor) => residingAuthor.id === author.id,
          )
        ) {
          store.residingAuthors.push(author);
        }
      }
    });

    this.internalRegistry.set(author.id, author);
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
