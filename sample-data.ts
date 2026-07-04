import {
  Author,
  AuthorGroup,
  AuthorTimelineEvent,
  CityCoordinates,
  USState,
} from './src/models';

export const groups: Array<AuthorGroup> = [
  {
    id: 'ID for American Renaissance',
    name: 'American Renaissance',
    description:
      'The American Renaissance period in American literature ran from about 1830 to around the Civil War. A central term in American studies, the American Renaissance was for a while considered synonymous with American Romanticism and was closely associated with Transcendentalism.',
    span: {
      startDate: '1830',
      endDate: '1860',
    },
    link: 'https://en.wikipedia.org/wiki/American_Renaissance_(literature)',
  },
  {
    id: 'ID for Harlem Renaissance',
    name: 'Harlem Renaissance',
    description:
      'The Harlem Renaissance was an intellectual and cultural movement of African-American music, dance, art, fashion, literature, theater, politics, and scholarship centered in Harlem, Manhattan, New York City, spanning the 1920s and 1930s.',
    span: {
      startDate: '1918',
      endDate: '1929',
    },
  },
];

export const authors: Array<Author> = [
  {
    id: Symbol('ID for Herman Melville'),
    authorFirstName: 'Herman',
    authorLastName: 'Melville',
    portrait: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Herman_Melville_by_Joseph_O_Eaton.jpg/500px-Herman_Melville_by_Joseph_O_Eaton.jpg',
    },
    groups: [groups[0].id],
    inclusionReasons: [],
  },
  {
    id: Symbol('ID for Walt Whitman'),
    authorFirstName: 'Walt',
    authorLastName: 'Whitman',
    inclusionReasons: [],
    link: 'https://en.wikipedia.org/wiki/Walt_Whitman',
    portrait: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Walt_Whitman_-_George_Collins_Cox.jpg/500px-Walt_Whitman_-_George_Collins_Cox.jpg',
    },
    groups: [groups[0].id],
  },
  {
    id: Symbol('ID for Gertrude Stein'),
    authorFirstName: 'Gertrude',
    authorLastName: 'Stein',
    inclusionReasons: [],
    portrait: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Gertrude_Stein_1935-01-04.jpg/500px-Gertrude_Stein_1935-01-04.jpg',
    },
  },
  {
    id: Symbol('ID for Thomas Eliot'),
    authorFirstName: 'Thomas',
    authorLastName: 'Eliot',
    authorFullName: 'T. S. Eliot',
    inclusionReasons: [],
    portrait: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Thomas_Stearns_Eliot_by_Lady_Ottoline_Morrell_%281934%29.jpg',
    },
  },
  {
    id: Symbol('ID for Kurt Vonnegut'),
    authorFirstName: 'Kurt',
    authorLastName: 'Vonnegut',
    authorFullName: 'Kurt Vonnegut, Jr',
    inclusionReasons: [],
    portrait: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg/330px-Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg',
    },
  },
  {
    id: Symbol('ID for John Steinbeck'),
    authorFirstName: 'John',
    authorLastName: 'Steinbeck',
    authorFullName: 'John Ernst Steinbeck',
    inclusionReasons: [],
    portrait: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/John_Steinbeck_1939_%28cropped%29.jpg/500px-John_Steinbeck_1939_%28cropped%29.jpg',
    },
  },
];

export const timeline: Array<AuthorTimelineEvent> = [
  {
    id: Symbol('ID for Declaration of Independence'),
    date: '1776-07-04',
    location: {
      state: USState.PENNSYLVANIA,
      address: 'Pennsylvania State House, Philadelphia',
    },
    notes: 'Ratification of the Declaration of Independence',
    type: 'Milestone',
  },
  {
    id: Symbol('ID for Emancipation Proclamation'),
    date: '1863-01-01',
    notes: 'Issuance of the Emancipation Proclamation, under emergency powers',
    location: {},
    referenceUrl: 'https://en.wikipedia.org/wiki/Emancipation_Proclamation',
    type: 'Milestone',
  },
  {
    id: Symbol('ID for Leaves of Grass'),
    authorId: authors.find((author) => author.authorLastName === 'Whitman')!.id,
    date: '1855-07-04',
    /*
          achievement: {
            type: AuthorAchievementType.RENOWNED_WORK,
            workTitle: 'Leaves of Grass',
            referenceUrl: 'https://en.wikipedia.org/wiki/Leaves_of_Grass',
          },
          */
    notes: 'Self-published',
    type: 'Milestone',
  },
  {
    id: Symbol('ID for Steinbeck Nobel Prize'),
    authorId: authors.find((author) => author.authorLastName === 'Steinbeck')!
      .id,
    date: '1962',
    /*
          achievement: {
            awardName: 'Nobel Prize in Literature',
            type: AuthorAchievementType.AWARD,
          },
          */
    type: 'Milestone',
  },
];

export const cityCoordinates: Array<CityCoordinates> = [
  {
    location: {
      state: USState.NEW_YORK,
      address: 'New York City',
    },
    coordinates: [-74.006, 40.7128],
  },
];
