import sortedBy from 'lodash-es/sortBy';

import {
  Author,
  AuthorEventType,
  AuthorTimelineEvent,
  BirthEvent,
  DeathEvent,
  USState,
} from '../models';
import { getAuthorName } from './names';
import { getStartingDate } from './dates';

export interface AuthorSort {
  name?: boolean;
  birth?: boolean;
  death?: boolean;
}

export interface AuthorFilter {
  deceasedOnly?: boolean;
}

export class AuthorMapStores {
  dateRange: [number, number];

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
    return this.internalRegistry.size;
  }

  get timelineEvents(): Array<AuthorTimelineEvent> {
    return this.allEvents;
  }

  constructor(authors: Array<Author>, timeline: Array<AuthorTimelineEvent>) {
    this.internalRegistry = new Map();

    this.authorTimelines = new Map();

    this.majorEvents = new Map();

    this.allEvents = [];

    this.birthEventsByAuthor = new Map();

    this.deathEventsByAuthor = new Map();

    for (const author of authors) {
      this.add(author);
    }

    for (const event of timeline) {
      this.addTimelineEvent(event);
    }

    this.sortTimelineEvents();

    this.dateRange = [
      new Date(getStartingDate(this.allEvents.at(0)!)).getFullYear(),
      new Date().getFullYear(),
    ];
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

  getAuthor(id: Author['id']): Author {
    return this.internalRegistry.get(id)!;
  }

  getAuthors(
    state: USState,
    eventType?: AuthorEventType,
    address?: string,
  ): Array<Author> {
    switch (eventType) {
      case AuthorEventType.BIRTHS:
        return [...this.birthEventsByAuthor.entries()]
          .filter(
            ([, birthEvent]) =>
              birthEvent.location?.state === state &&
              (address ? birthEvent?.location?.address === address : true),
          )
          .map(([authorId]) => this.internalRegistry.get(authorId)!);
      case AuthorEventType.DEATHS:
        return [...this.deathEventsByAuthor.entries()]
          .filter(
            ([, deathEvent]) =>
              deathEvent.location?.state === state &&
              (address ? deathEvent?.location?.address === address : true),
          )
          .map(([authorId]) => this.internalRegistry.get(authorId)!);
      default:
        return [...this.internalRegistry.values()].filter((author) =>
          this.hasAuthorResided(author.id, state),
        );
    }
  }

  getAuthorTimeline(authorId: Author['id']): Array<AuthorTimelineEvent>;
  getAuthorTimeline(
    authorId: Author['id'],
    noBirthAndDeath: true,
  ): Array<Exclude<AuthorTimelineEvent, BirthEvent | DeathEvent>>;
  getAuthorTimeline(authorId: Author['id'], noBirthAndDeath = false) {
    if (this.authorTimelines.has(authorId)) {
      const timelineMap = this.authorTimelines.get(authorId)!;

      let events = [...timelineMap.values()];

      if (noBirthAndDeath) {
        events = events.filter((event) => {
          switch (event.type) {
            case 'Birth':
            case 'Death':
              return false;
            default:
              return true;
          }
        });
      }

      return events;
    } else {
      return [];
    }
  }

  setAuthorTimeline(
    authorId: Author['id'],
    timeline: Array<AuthorTimelineEvent>,
  ): void {
    const preexistingEventKeys = new Set(
      this.authorTimelines.get(authorId)?.keys(),
    );

    this.authorTimelines.set(
      authorId,
      new Map(timeline.map((event) => [event.id, event] as const)),
    );

    this.allEvents = this.allEvents
      .filter((event) => !preexistingEventKeys.has(event.id))
      .concat(timeline);

    this.sortTimelineEvents();
  }

  getBirthDate(authorId: Author['id']): BirthEvent | undefined {
    return this.birthEventsByAuthor.get(authorId);
  }

  setBirthDate(authorId: Author['id'], birthEvent: BirthEvent): void {
    this.birthEventsByAuthor.set(authorId, birthEvent);
  }

  getDeathDate(authorId: Author['id']): DeathEvent | undefined {
    return this.deathEventsByAuthor.get(authorId);
  }

  setDeathDate(authorId: Author['id'], deathEvent: DeathEvent): void {
    this.deathEventsByAuthor.set(authorId, deathEvent);
  }

  removeDeathDate(authorId: Author['id']): void {
    this.deathEventsByAuthor.delete(authorId);
  }

  add(author: Author): void {
    this.internalRegistry.set(author.id, author);
  }

  update(author: Author): void {
    this.remove(author.id);

    this.add(author);
  }

  remove(authorId: Author['id']) {
    if (this.internalRegistry.has(authorId)) {
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

      this.authorTimelines.set(event.authorId, authorTimeline);

      if (event.type === 'Birth') {
        this.birthEventsByAuthor.set(event.authorId, event);
      } else if (event.type === 'Death') {
        this.deathEventsByAuthor.set(event.authorId, event);
      }
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

  private sortAuthorTimelineEvents(authorId: Author['id']): void {
    if (this.authorTimelines.has(authorId)) {
      const authorTimeline = this.authorTimelines.get(authorId)!;

      const sortedAuthorTimeline = sortedBy(
        [...authorTimeline.entries()],
        ([, value]) =>
          this.getTimelineEventSortingAttribute(value as AuthorTimelineEvent),
      );

      this.authorTimelines.set(authorId, new Map(sortedAuthorTimeline));
    }
  }

  private sortTimelineEvents(): void {
    for (const authorId of this.authorTimelines.keys()) {
      this.sortAuthorTimelineEvents(authorId);
    }

    const sortedMajorEvents = sortedBy(
      [...this.majorEvents.entries()],
      ([, value]) =>
        this.getTimelineEventSortingAttribute(value as AuthorTimelineEvent),
    );

    this.majorEvents = new Map(sortedMajorEvents);

    this.allEvents = sortedBy(
      this.allEvents,
      this.getTimelineEventSortingAttribute,
    );
  }

  private getTimelineEventSortingAttribute = (
    event: AuthorTimelineEvent,
  ): Date => {
    switch (event.type) {
      case 'Milestone':
      case 'Birth':
      case 'Death':
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
    authorId: Author['id'],
    usState: USState,
    [yearStart, yearEnd]: [number, number],
    address?: string,
  ): boolean {
    const timeline = this.getAuthorTimeline(authorId);

    return timeline
      .filter((event) => {
        switch (event.type) {
          case 'Timeline':
            const dateStartYear = new Date(event.startDate).getFullYear(),
              dateEndYear = new Date(event.endDate).getFullYear();
            return dateStartYear >= yearStart && dateEndYear <= yearEnd;
          default:
            const dateYear = new Date(event.date).getFullYear();
            return yearStart <= dateYear && dateYear <= yearEnd;
        }
      })
      .some((event) => {
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
