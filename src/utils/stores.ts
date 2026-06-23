import sortedBy from 'lodash-es/sortBy';

import {
  Author,
  AuthorEventType,
  AuthorTimelineEvent,
  AwardInclusionReason,
  BirthEvent,
  ClassicPublisherReason,
  DeathEvent,
  PersonalReason,
  PoetLaureateReason,
  USState,
} from '../models';
import { getAuthorName } from './names';
import { getStartingDate } from './dates';
import { sortMap } from './sort';

export interface AuthorSort {
  name?: boolean;
  birth?: boolean;
  death?: boolean;
}

export interface AuthorFilter {
  deceasedOnly?: boolean;
}

export type InclusionReasonFilter =
  | PoetLaureateReason['type']
  | PersonalReason['type']
  | Pick<AwardInclusionReason, 'type' | 'award'>
  | {
      type: ClassicPublisherReason['type'];
      publishers: Array<keyof ClassicPublisherReason['publishers']>;
    };

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

    const firstEvent = this.allEvents.at(0),
      currentYear = new Date().getFullYear();

    this.dateRange = [
      firstEvent
        ? new Date(getStartingDate(firstEvent)).getFullYear()
        : currentYear - 1,
      currentYear,
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
    {
      eventType,
      address,
      inclusionReasons,
    }: {
      eventType?: AuthorEventType;
      address?: string;
      inclusionReasons?: Array<InclusionReasonFilter>;
    } = {},
  ): Array<Author> {
    let authorIds: Array<Author['id']>;

    switch (eventType) {
      case AuthorEventType.BIRTHS:
        authorIds = [...this.birthEventsByAuthor.entries()]
          .filter(
            ([, birthEvent]) =>
              birthEvent.location?.state === state &&
              (address ? birthEvent?.location?.address === address : true),
          )
          .map(([authorId]) => authorId);
        break;
      case AuthorEventType.DEATHS:
        authorIds = [...this.deathEventsByAuthor.entries()]
          .filter(
            ([, deathEvent]) =>
              deathEvent.location?.state === state &&
              (address ? deathEvent?.location?.address === address : true),
          )
          .map(([authorId]) => authorId);
        break;
      default:
        authorIds = [...this.internalRegistry.values()]
          .filter((author) => this.hasAuthorResided(author.id, state))
          .map((author) => author.id);
        break;
    }

    let authors = authorIds.map(
      (authorId) => this.internalRegistry.get(authorId)!,
    );

    if (inclusionReasons) {
      authors = authors.filter((author) => {
        return author.inclusionReasons.some((reason) => {
          return inclusionReasons.some((filterReason) => {
            if (typeof filterReason === 'string') {
              return filterReason === reason.type;
            } else if ('award' in filterReason && reason.type === 'award') {
              return filterReason.award === reason.award;
            } else if (
              'publishers' in filterReason &&
              reason.type === 'Published as classical literature'
            ) {
              return filterReason.publishers.some((publisher) =>
                Boolean(reason.publishers[publisher]),
              );
            } else {
              return false;
            }
          });
        });
      });
    }

    return authors;
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

      const sortedAuthorTimeline = sortMap(authorTimeline, ([, value]) =>
        this.getTimelineEventSortingAttribute(value),
      );

      this.authorTimelines.set(authorId, new Map(sortedAuthorTimeline));
    }
  }

  private sortTimelineEvents(): void {
    for (const authorId of this.authorTimelines.keys()) {
      this.sortAuthorTimelineEvents(authorId);
    }

    const comparatorFn = ([, value]: [Author['id'], AuthorTimelineEvent]) =>
      this.getTimelineEventSortingAttribute(value);

    this.majorEvents = sortMap(this.majorEvents, comparatorFn);

    this.birthEventsByAuthor = sortMap(this.birthEventsByAuthor, comparatorFn);

    this.deathEventsByAuthor = sortMap(this.deathEventsByAuthor, comparatorFn);

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
    [yearStart, yearEnd]: [number, number] = [0, Infinity],
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
