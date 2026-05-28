/*
import {
  Author,
  AuthorEventType,
  BaseTimelineEvent,
  MilestoneEvent,
  USState,
} from '../models';
import { formatDate } from './dates';

interface EventFilters {
  usState?: USState;
  eventType?: AuthorEventType;
}

export interface AuthorEvent extends BaseTimelineEvent {
  dateContext: string;
  eventType?: AuthorEventType;
}

export function getEvents(
  author: Author,
  filters?: EventFilters,
): Array<AuthorEvent> {
  let events: Array<AuthorEvent> = [
    {
      ...author.birthDate,
      notes: 'Birth',
      dateContext: formatDate(
        author.birthDate.date,
        author.birthDate.location?.state,
      ),
      eventType: AuthorEventType.BIRTHS,
    },
    ...author.timeline.map((event) => {
      let dateContext: string;
      if ('date' in event) {
        dateContext = formatDate(event.date, event.location?.state);
      } else {
        dateContext = `${formatDate(event.startDate, event.location?.state)} - ${formatDate(event.endDate, event.location?.state)}`;
      }

      return {
        ...event,
        dateContext,
      };
    }),
  ];

  if (author.deathDate) {
    events = events.concat({
      ...author.deathDate,
      notes: 'Death',
      dateContext: formatDate(
        author.deathDate.date,
        author.deathDate.location?.state,
      ),
      eventType: AuthorEventType.DEATHS,
    });
  }

  if (filters) {
    if (filters.usState) {
      events = events.filter(
        (event) => event.location?.state === filters.usState,
      );
    }
    if (filters.eventType) {
      events = events.filter((event) => event.eventType === filters.eventType);
    }
  }

  return events;
}

interface GetMilestoneEventsArgs {
  achievementsOnly?: boolean;
  excludeBirthAndDeath?: boolean;
}

export function getMilestoneEvents(
  author: Author,
  { achievementsOnly, excludeBirthAndDeath }: GetMilestoneEventsArgs = {},
): Array<MilestoneEvent> {
  let events: Array<MilestoneEvent> = [];

  if (!excludeBirthAndDeath) {
    events = events.concat({ ...author.birthDate, notes: 'Birth' });
  }

  let milestoneEvents = author.timeline.filter((event) => 'date' in event);

  if (achievementsOnly) {
    milestoneEvents = milestoneEvents.filter((event) =>
      Boolean(event.achievement),
    );
  }

  events = events.concat(milestoneEvents);

  if (!excludeBirthAndDeath && author.deathDate) {
    events = events.concat({ ...author.deathDate, notes: 'Death' });
  }

  return events;
}

*/
