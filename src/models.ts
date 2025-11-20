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
  location?: AuthorLocation;
  /** Additional comments on the event. */
  notes?: string;
}

export interface TimelineEvent extends BaseTimelineEvent, TimeSpan {}

export interface MilestoneEvent extends BaseTimelineEvent {
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  date: string;
}

export type AuthorTimelineEvent = TimelineEvent | MilestoneEvent;

export interface MajorEvent extends MilestoneEvent {
  id: string | Symbol;

  referenceUrl?: string;
}

/**
 * Does not refer to a group in a physical sense. "Group" is arbitrary and can refer to any possible interesting category.
 * For example, "Jewish American writers", "Belonging to the Harlem Renaissance", "pre-Republic", etc.
 */
export interface AuthorGroup {
  /**
   * Highly recommended for update operations, in case authors have name collision. Also highly recommended for performance.
   */
  id: string | Symbol;

  /** Assumed to be unique. */
  name: string;
  description: string;
  span?: TimeSpan;
  link?: string;
}

export interface Author {
  /**
   * Highly recommended for update operations, in case authors have name collision. Also highly recommended for performance.
   */
  id: string | Symbol;

  authorFirstName: string;
  authorLastName: string;

  /** Preferred over first and last name if filled in. Use for those with middle names. */
  authorFullName?: string;

  /** Preferred over all names. */
  authorDisplayName?: string;

  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  birthDate: MilestoneEvent;
  /** ISO YYYY-MM-DD datestring. Any more precision seems unneeded. */
  deathDate?: MilestoneEvent;
  /** Assume the timeline is ordered. Birth and death dates are redundant. */
  timeline: Array<TimelineEvent | MilestoneEvent>;

  link?: string;
  portrait?: PortraitData;

  groups?: Array<AuthorGroup['id']>;
}

export interface StateStore {
  bornAuthors: Array<Author>;
  deceasedAuthors: Array<Author>;
  residingAuthors: Array<Author>;
}
