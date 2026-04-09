import sortedBy from 'lodash-es/sortBy';

import {
  Author,
  AuthorEventType,
  AuthorTimelineEvent,
  BirthEvent,
  DeathEvent,
  StateStore,
  USState,
} from '../models';
import { getAuthorName } from './names';

export interface AuthorSort {
  name?: boolean;
  birth?: boolean;
  death?: boolean;
}

export interface AuthorFilter {
  deceasedOnly?: boolean;
}

export class AuthorMapStores {
  private map: Map<USState, StateStore>;
  private internalRegistry: Map<Author['id'], Author>;
  private authorTimelines: Map<
    Author['id'],
    Map<AuthorTimelineEvent['id'], AuthorTimelineEvent>
  >;
  private majorEvents: Map<AuthorTimelineEvent['id'], AuthorTimelineEvent>;
  private allEvents: Array<AuthorTimelineEvent>;
  private birthEventsByAuthor: Map<Author['id'], BirthEvent>;
  private deathEventsByAuthor: Map<Author['id'], DeathEvent>;

  get numAuthors(): number {
    return this.map.size;
  }

  get timelineEvents(): Array<AuthorTimelineEvent> {
    return this.allEvents;
  }

  constructor(authors: Array<Author>, timeline: Array<AuthorTimelineEvent>) {
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

    this.authorTimelines = new Map();

    this.majorEvents = new Map();

    this.allEvents = [];

    this.birthEventsByAuthor = new Map();

    this.deathEventsByAuthor = new Map();

    for (const event of timeline) {
      this.addTimelineEvent(event);
    }

    this.sortTimelineEvents();

    for (const author of authors) {
      this.add(author);
    }
  }

  getAll(
    sort: AuthorSort = { name: true },
    { deceasedOnly }: AuthorFilter = {},
  ): Array<Author> {
    // Guaranteeing authors have a birth date.
    let authors = Array.from(this.internalRegistry.values());

    if (deceasedOnly) {
      authors = authors.filter((author) =>
        Boolean(this.deathEventsByAuthor.get(author.id)),
      );
    }

    if (sort.name) {
      return authors.sort((a, b) =>
        getAuthorName(a).localeCompare(getAuthorName(b)),
      );
    } else if (sort.birth) {
      return authors.sort((a, b) => {
        const aBirthDate = this.birthEventsByAuthor.get(a.id)!,
          bBirthDate = this.birthEventsByAuthor.get(b.id)!;

        if (!(aBirthDate || bBirthDate)) {
          return 0;
        } else if (!aBirthDate) {
          return 1;
        } else if (!bBirthDate) {
          return -1;
        } else {
          return (
            new Date(aBirthDate.date).valueOf() -
            new Date(bBirthDate.date).valueOf()
          );
        }
      });
    } else if (sort.death) {
      return authors.sort((a, b) => {
        const aDeathDate = this.deathEventsByAuthor.get(a.id)!,
          bDeathDate = this.deathEventsByAuthor.get(b.id)!;

        if (!(aDeathDate || bDeathDate)) {
          return 0;
        } else if (!aDeathDate) {
          return 1;
        } else if (!bDeathDate) {
          return -1;
        } else {
          return (
            new Date(aDeathDate.date).valueOf() -
            new Date(bDeathDate.date).valueOf()
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

  getAuthor(id: Author['id']): Author {
    return this.internalRegistry.get(id)!;
  }

  getAuthors(
    state: USState,
    eventType?: AuthorEventType,
    address?: string,
  ): Array<Author> {
    const stateData = this.get(state);

    switch (eventType) {
      case AuthorEventType.BIRTHS:
        return stateData.bornAuthors.filter((author) => {
          const birthDate = this.birthEventsByAuthor.get(author.id);
          return !Boolean(address) || birthDate?.location?.address === address;
        });
      case AuthorEventType.DEATHS:
        return stateData.deceasedAuthors.filter((author) => {
          const deathDate = this.deathEventsByAuthor.get(author.id);
          return !Boolean(address) || deathDate?.location?.address === address;
        });
      default:
        return stateData.residingAuthors.filter(
          (author) =>
            !Boolean(address) || this.hasAuthorResided(author, state, address),
        );
    }
  }

  getAuthorTimeline(author: Author): Array<AuthorTimelineEvent> {
    if (this.authorTimelines.has(author.id)) {
      const timelineMap = this.authorTimelines.get(author.id)!;

      return [...timelineMap.values()];
    } else {
      return [];
    }
  }

  getBirthDate(authorId: Author['id']): AuthorTimelineEvent | undefined {
    return this.birthEventsByAuthor.get(authorId);
  }

  getDeathDate(authorId: Author['id']): AuthorTimelineEvent | undefined {
    return this.deathEventsByAuthor.get(authorId);
  }

  add(author: Author): void {
    const { map } = this;

    let fullTimeline: Array<Omit<AuthorTimelineEvent, 'id'>> = [
      ...this.getAuthorTimeline(author),
    ];

    // Birth state
    const birthEvent = this.birthEventsByAuthor.get(author.id);

    if (birthEvent) {
      const state = birthEvent.location?.state;

      if (state) {
        const store = map.get(state)!;

        const birthEventDate = new Date(birthEvent.date);

        const succeedingIndex = store.bornAuthors.findIndex((author) => {
          return birthEventDate < new Date(birthEvent.date);
        });

        if (succeedingIndex === -1) {
          store.bornAuthors.push(author);
        } else {
          store.bornAuthors.splice(succeedingIndex, 0, author);
        }
      }

      this.addTimelineEvent({
        ...birthEvent,
        type: 'Milestone',
        id: Symbol(`Birth of ${getAuthorName(author)}`),
      });

      fullTimeline = [
        { ...birthEvent, notes: 'Birth', type: 'Milestone' },
        ...fullTimeline,
      ];
    }

    // Death state
    const deathEvent = this.deathEventsByAuthor.get(author.id);

    if (deathEvent) {
      const state = deathEvent.location?.state;

      if (state) {
        const store = map.get(state)!;

        const deathEventDate = new Date(deathEvent.date);

        const succeedingIndex = store.deceasedAuthors.findIndex((author) => {
          const authorDeathEvent = this.deathEventsByAuthor.get(author.id);
          return deathEventDate < new Date(authorDeathEvent!.date);
        });

        if (succeedingIndex === -1) {
          store.deceasedAuthors.push(author);
        } else {
          store.deceasedAuthors.splice(succeedingIndex, 0, author);
        }
      }

      this.addTimelineEvent({
        ...deathEvent,
        type: 'Milestone',
        id: Symbol(`Death of ${getAuthorName(author)}`),
      });

      fullTimeline = [
        ...fullTimeline,
        { ...deathEvent, notes: 'Death', type: 'Milestone' },
      ];
    }

    // Residing states
    fullTimeline.forEach((event) => {
      const state = event.location?.state;
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

      this.authorTimelines.delete(authorId);
    }
  }

  addTimelineEvent(event: AuthorTimelineEvent): void {
    if (event.authorId) {
      let authorTimeline: Map<AuthorTimelineEvent['id'], AuthorTimelineEvent>;

      if (this.authorTimelines.has(event.authorId)) {
        authorTimeline = this.authorTimelines.get(event.authorId)!;
      } else {
        authorTimeline = new Map();
      }

      authorTimeline.set(event.id, event);
    } else {
      this.majorEvents.set(event.id, event);
    }

    this.allEvents.push(event);
  }

  removeTimelineEvent(event: AuthorTimelineEvent): void {
    if (event.authorId) {
      const authorTimeline = this.authorTimelines.get(event.authorId)!;

      authorTimeline.delete(event.id);
    } else {
      this.majorEvents.delete(event.id);
    }

    this.allEvents = this.allEvents.filter((e) => e.id !== event.id);
  }

  updateTimelineEvent(event: AuthorTimelineEvent): void {
    this.removeTimelineEvent(event);

    this.addTimelineEvent(event);
  }

  sortTimelineEvents(): void {
    for (const [authorId, authorTimeline] of this.authorTimelines.entries()) {
      const sortedAuthorTimeline = sortedBy(
        [...authorTimeline.entries()],
        ([, value]) =>
          this.getTimelineEventSortingAttribute(value as AuthorTimelineEvent),
      );

      this.authorTimelines.set(authorId, new Map(sortedAuthorTimeline));
    }

    const sortedMajorEvents = sortedBy(
      [...this.majorEvents.entries()],
      ([, value]) =>
        this.getTimelineEventSortingAttribute(value as AuthorTimelineEvent),
    );

    this.majorEvents = new Map(sortedMajorEvents);

    sortedBy(this.allEvents, this.getTimelineEventSortingAttribute);
  }

  private getTimelineEventSortingAttribute = (
    event: AuthorTimelineEvent,
  ): Date => {
    switch (event.type) {
      case 'Milestone':
        return new Date(event.date);
      case 'Timeline':
        return new Date(event.startDate);
      default:
        throw new Error(
          `No chosen date attribute for AuthorTimelineEvent. ${JSON.stringify(event, undefined, 2)}`,
        );
    }
  };

  private hasAuthorResided(
    author: Author,
    usState: USState,
    address?: string,
  ): boolean {
    const birthEvent = this.birthEventsByAuthor.get(author.id);

    let fullTimeline: Array<AuthorTimelineEvent> = [];

    if (birthEvent) {
      fullTimeline = [birthEvent];
    }

    fullTimeline = fullTimeline.concat(this.getAuthorTimeline(author));

    const deathEvent = this.deathEventsByAuthor.get(author.id);

    if (deathEvent) {
      fullTimeline = fullTimeline.concat(deathEvent);
    }

    return fullTimeline.some((event) => {
      const { location } = event;

      if (location) {
        if (location.state) {
          const value = location.state === usState;

          if (address) {
            return value && location.address === address;
          } else {
            return value;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
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
