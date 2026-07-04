import type { ImgHTMLAttributes } from 'react';

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

export enum USState {
  ALABAMA = 'Alabama',
  ALASKA = 'Alaska',
  ARIZONA = 'Arizona',
  ARKANSAS = 'Arkansas',
  CALIFORNIA = 'California',
  COLORADO = 'Colorado',
  CONNECTICUT = 'Connecticut',
  DELAWARE = 'Delaware',
  FLORIDA = 'Florida',
  GEORGIA = 'Georgia',
  HAWAII = 'Hawaii',
  IDAHO = 'Idaho',
  ILLINOIS = 'Illinois',
  INDIANA = 'Indiana',
  IOWA = 'Iowa',
  KANSAS = 'Kansas',
  KENTUCKY = 'Kentucky',
  LOUISIANA = 'Louisiana',
  MAINE = 'Maine',
  MARYLAND = 'Maryland',
  MASSACHUSSETTS = 'Massachusetts',
  MICHIGAN = 'Michigan',
  MINNESOTA = 'Minnesota',
  MISSISSIPPI = 'Mississippi',
  MISSOURI = 'Missouri',
  MONTANA = 'Montana',
  NEBRASKA = 'Nebraska',
  NEVADA = 'Nevada',
  NEW_HAMPSHIRE = 'New Hampshire',
  NEW_JERSEY = 'New Jersey',
  NEW_MEXICO = 'New Mexico',
  NEW_YORK = 'New York',
  NORTH_CAROLINA = 'North Carolina',
  NORTH_DAKOTA = 'North Dakota',
  OHIO = 'Ohio',
  OKLAHOMA = 'Oklahoma',
  OREGON = 'Oregon',
  PENNSYLVANIA = 'Pennsylvania',
  RHODE_ISLAND = 'Rhode Island',
  SOUTH_CAROLINA = 'South Carolina',
  SOUTH_DAKOTA = 'South Dakota',
  TENNESSEE = 'Tennessee',
  TEXAS = 'Texas',
  UTAH = 'Utah',
  VERMONT = 'Vermont',
  VIRGINIA = 'Virginia',
  WASHINGTON = 'Washington',
  WEST_VIRGINIA = 'West Virginia',
  WISCONSIN = 'Wisconsin',
  WYOMING = 'Wyoming',
}

const EasternTimeZoneStates: Array<USState> = [
  USState.CONNECTICUT,
  USState.DELAWARE,
  USState.FLORIDA,
  USState.GEORGIA,
  USState.INDIANA,
  USState.KENTUCKY,
  USState.MAINE,
  USState.MARYLAND,
  USState.MASSACHUSSETTS,
  USState.MICHIGAN,
  USState.NEW_HAMPSHIRE,
  USState.NEW_JERSEY,
  USState.NEW_YORK,
  USState.NORTH_CAROLINA,
  USState.OHIO,
  USState.RHODE_ISLAND,
  USState.SOUTH_CAROLINA,
  USState.TENNESSEE,
  USState.VERMONT,
  USState.VIRGINIA,
  USState.WEST_VIRGINIA,
];

const CentralTimeZoneStates: Array<USState> = [
  USState.ALABAMA,
  USState.ARKANSAS,
  USState.ILLINOIS,
  USState.IOWA,
  USState.KANSAS,
  USState.LOUISIANA,
  USState.MINNESOTA,
  USState.MISSISSIPPI,
  USState.MISSOURI,
  USState.NEBRASKA,
  USState.NORTH_DAKOTA,
  USState.OKLAHOMA,
  USState.SOUTH_DAKOTA,
  USState.TEXAS,
  USState.WISCONSIN,
];

const NonWesternTimeZoneStates = [
  ...EasternTimeZoneStates,
  ...CentralTimeZoneStates,
];

const WesternTimeZoneStates: Array<USState> = Object.values(USState).filter(
  (usState) => !NonWesternTimeZoneStates.includes(usState),
);

export const stateToTimezoneMap = new Map<USState, string>([
  ...EasternTimeZoneStates.map((state) => [state, 'America/New_York'] as const),
  ...CentralTimeZoneStates.map((state) => [state, 'America/Chicago'] as const),
  ...WesternTimeZoneStates.map(
    (state) => [state, 'America/Los_Angeles'] as const,
  ),
]);

export const monthOptions: Array<{ label: string; value: number }> = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

export interface AuthorLocation {
  /** If this is omitted, it is assumed the event did not take place in the States; therefore, the event is not formally recorded in the map. */
  state?: USState;
  /** Does not have to be the full address; city / town / village is fine. Called 'address' not to bias for city. */
  address?: string;
}

export interface PortraitData extends ImgHTMLAttributes<HTMLImageElement> {
  /** Use to properly credit the photo source. */
  attribution?: string;
}

export interface TimeSpan {
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  startDate: string;
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  endDate: string;
}

export interface BaseTimelineEvent {
  id: string | Symbol;

  authorId?: Author['id'];
  location?: AuthorLocation;
  /** Additional comments on the event. */
  notes?: string;
  referenceUrl?: string;
}

type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface BirthEvent
  extends MakeRequired<BaseTimelineEvent, 'authorId'> {
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  date: string;
  type: 'Birth';
}

export interface DeathEvent
  extends MakeRequired<BaseTimelineEvent, 'authorId'> {
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  date: string;
  type: 'Death';
}

export interface TimelineEvent extends BaseTimelineEvent, TimeSpan {
  type: 'Timeline';
}

export interface MilestoneEvent extends BaseTimelineEvent {
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  date: string;
  type: 'Milestone';
}

export interface MajorTimelineEvent extends BaseTimelineEvent, TimeSpan {}

export interface MajorMilestoneEvent extends BaseTimelineEvent {
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  date: string;
}

export type MajorEvent = (MajorMilestoneEvent | MajorTimelineEvent) & {
  type: 'Major event';
};

export type AuthorTimelineEvent =
  | BirthEvent
  | DeathEvent
  | TimelineEvent
  | MilestoneEvent
  | MajorEvent;

/**
 * Does not refer to a group in a physical sense. "Group" is arbitrary and can refer to any possible interesting category.
 * For example, "Jewish American writers", "Belonging to the Harlem Renaissance", "pre-Republic", etc.
 */
export interface AuthorGroup {
  id: string;

  /** Assumed to be unique. */
  name: string;
  description: string;
  span?: TimeSpan;
  link?: string;
}

export interface PoetLaureateReason {
  type: 'Poet Laureate';
  /** Meaning, a reference to the webpage where the info was scraped. */
  referenceUrl: string;
  dates: Array<{
    startYear: number;
    endYear?: number;
  }>;
}

export interface AuthorGroupReason {
  type: 'Belongs to a renowned group';
  referenceUrl: string;
  groupId: AuthorGroup['id'];
}

export enum AmericanLiteraryAward {
  NOBEL_PRIZE_IN_LITERATURE = 'Nobel Prize in Literature',
  PULITZER_FICTION = 'Pulitzer Prize for Fiction',
  PULITZER_POETRY = 'Pulitzer Prize for Poetry',
  NATIONAL_BOOK_FICTION = 'National Book Award for Fiction',
  NATIONAL_BOOK_POETRY = 'National Book Award for Poetry',
}

export enum ClassicPublisher {
  NYRB = 'NYRB',
  PENGUIN_CLASSIC = 'Penguin Classic',
  NORTON = 'Norton',
  LIBRARY_OF_AMERICA = 'Library of America',
  DALKEY = 'Dalkey Archive Press',
}

export interface ClassicPublisherCatalog {
  books: Array<{
    /** Meaning, a reference to the webpage where the info was scraped. */
    referenceUrl: string;
    name: string;
  }>;
}

export interface ClassicPublisherReason {
  type: 'Published as classical literature';
  publishers: Partial<{
    [publisher in ClassicPublisher]: ClassicPublisherCatalog;
  }>;
}

export interface AcademicCitationReason {
  /** Meaning, a reference to the webpage where the info was scraped. */
  referenceUrl: string;
  type: 'Academia citation';
  count: number;
}

export interface AwardInclusionReason {
  /** Meaning, a reference to the webpage where the info was scraped. */
  referenceUrl: string;
  award: AmericanLiteraryAward;
  year: number;
  type: 'award';

  book?: string;
}

export interface PersonalReason {
  type: 'Because I said so; source: me';
}

/**
 * It strikes me that this is more useful if there is a cut-off point - ex. the beginning of the millenium or (current date - 10 years).
 * The purpose of the map is to operate via hindsight and not to shape history as it is happening.
 */
export type AuthorInclusionReason =
  | PoetLaureateReason
  | ClassicPublisherReason
  /*| AcademicCitationReason*/ // TODO
  | AwardInclusionReason
  | PersonalReason
  | AuthorGroupReason;

export interface Author {
  id: string | Symbol;

  authorFirstName: string;
  authorLastName: string;

  inclusionReasons: Array<AuthorInclusionReason>;

  /** Preferred over first and last name if filled in. Use for those with middle names. */
  authorFullName?: string;

  /** Preferred over all names. */
  authorDisplayName?: string;

  link?: string;
  portrait?: PortraitData;

  groups?: Array<AuthorGroup['id']>;
}

export interface CityCoordinates {
  coordinates: [number, number];
  location: Required<AuthorLocation>;
}

export interface AuthorBook {
  authorId: Author['id'];
  title: string;
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  publicationDate: string;
}

export interface AuthorData {
  author: Author;
  birthDate: BirthEvent;

  deathDate?: DeathEvent;
  timeline?: Array<AuthorTimelineEvent>;
}

export interface InclusionReasonValues {
  poetLaureates: boolean;
  personal: boolean;
  authorGroup: boolean;
  publishers: {
    collapsed: boolean;
    checked: boolean;
    specific: {
      [key in ClassicPublisher]: boolean;
    };
  };
  awards: {
    collapsed: boolean;
    checked: boolean;
    specific: {
      [key in AmericanLiteraryAward]: boolean;
    };
  };
}
export interface AuthorMapFilters {
  inclusionReasons: InclusionReasonValues;
  yearRange: [number, number];
  eventTypes: Array<AuthorTimelineEvent['type']>;
  formula: AuthorMapFormulaFilter;

  search?: string;
  groupId?: AuthorGroup['id'];
}

export interface AuthorMapProps {
  authors: Array<Author>;

  /**
   * Whether the client should be disabled from adding and editing authors / groups etc.
   * If a string is provided, this is the error message shown to user explaining why they cannot take any actions.
   */
  disabled?: boolean | string;

  groups?: Array<AuthorGroup>;

  timeline?: Array<AuthorTimelineEvent>;

  cityCoordinates?: Array<CityCoordinates>;

  /**
   * Use if you want to show a state's entry into the union, if you want to have a sense of time for the author.
   * The value is a valid ISO datestring.
   */
  entriesIntoUnion?: {
    [state in USState]: string;
  };

  /**
   * Use if you want to show the state's most recent population count. Useful if you want to ask questions concerning population.
   * Though population count over time would be useful, not supported ATM.
   */
  stateCensus?: {
    [state in USState]: {
      count: number;
      /** ISO datestring. */
      dateRecorded: string;
    };
  };

  className?: string;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   * TODO: How should IDs be handled?
   */
  syncAuthorAdded?: (author: AuthorData) => void | Promise<void>;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   */
  syncAuthorUpdate?: (changedAuthor: AuthorData) => void | Promise<void>;

  onGroupCreated?: (authorGroup: AuthorGroup) => void | Promise<void>;

  onGroupUpdated?: (authorGroup: AuthorGroup) => void | Promise<void>;

  onTimelineEventCreated?: (event: AuthorTimelineEvent) => void | Promise<void>;

  onTimelineEventUpdated?: (event: AuthorTimelineEvent) => void | Promise<void>;
}

export type AuthorMapFormulaEquation = string;

export interface AuthorMapFormulaFilter {
  equation: AuthorMapFormulaEquation;
  threshold: number;
}
