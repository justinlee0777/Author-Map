import type { ImgHTMLAttributes } from 'react';

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

export enum AuthorEventType {
  BIRTHS = 'Births',
  DEATHS = 'Deaths',
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

export type AuthorTimelineEvent =
  | BirthEvent
  | DeathEvent
  | TimelineEvent
  | MilestoneEvent;

/**
 * Does not refer to a group in a physical sense. "Group" is arbitrary and can refer to any possible interesting category.
 * For example, "Jewish American writers", "Belonging to the Harlem Renaissance", "pre-Republic", etc.
 */
export interface AuthorGroup {
  id: string | Symbol;

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
  | AcademicCitationReason
  | AwardInclusionReason
  | PersonalReason;

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
