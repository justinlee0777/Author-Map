import ReactDOM from 'react-dom/client';

import { AuthorMap } from './src/AuthorMap';
import { Author, USState } from './src/models';

const App = () => {
  const hardcodedAuthors: Array<Author> = [
    {
      authorFirstName: 'Walt',
      authorLastName: 'Whitman',
      birthDate: '1819-05-31',
      deathDate: '1892-03-26',
      timeline: [
        {
          location: {
            state: USState.NEW_YORK,
            address: 'Huntington',
          },
          startDate: '1819-05-31',
          endDate: '1823',
        },
        {
          location: {
            state: USState.NEW_JERSEY,
            address: 'Camden',
          },
          startDate: '1892-03-26',
          endDate: '1892-03-26',
        },
      ],
      link: 'https://en.wikipedia.org/wiki/Walt_Whitman',
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Walt_Whitman_-_George_Collins_Cox.jpg/500px-Walt_Whitman_-_George_Collins_Cox.jpg',
      },
    },
    {
      authorFirstName: 'Herman',
      authorLastName: 'Melville',
      birthDate: '1819-08-01',
      deathDate: '1891-09-28',
      timeline: [
        {
          location: {
            state: USState.NEW_YORK,
            address: 'New York City',
          },
          startDate: '1819-08-01',
          endDate: '1830',
        },
        {
          location: {
            state: USState.NEW_YORK,
            address: 'New York City',
          },
          startDate: '1891-09-28',
          endDate: '1891-09-28',
        },
      ],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Herman_Melville_by_Joseph_O_Eaton.jpg/500px-Herman_Melville_by_Joseph_O_Eaton.jpg',
      },
    },
    {
      authorFirstName: 'Gertrude',
      authorLastName: 'Stein',
      birthDate: '1874-02-03',
      deathDate: '1946-07-27',
      timeline: [
        {
          location: {
            state: USState.PENNSYLVANIA,
            address: 'Allegheny',
          },
          startDate: '1874-02-03',
          endDate: '1877',
        },
      ],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Gertrude_Stein_1935-01-04.jpg/500px-Gertrude_Stein_1935-01-04.jpg',
      },
    },
    {
      authorFirstName: 'Thomas',
      authorLastName: 'Eliot',
      authorFullName: 'T. S. Eliot',
      birthDate: '1888-09-26',
      deathDate: '1965-01-04',
      timeline: [
        {
          location: {
            state: USState.MISSOURI,
            address: 'St. Louis',
          },
          startDate: '1888-09-26',
          endDate: '1905',
        },
      ],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Thomas_Stearns_Eliot_by_Lady_Ottoline_Morrell_%281934%29.jpg',
      },
    },
    {
      authorFirstName: 'John',
      authorLastName: 'Steinbeck',
      authorFullName: 'John Ernst Steinbeck',
      birthDate: '1902-02-27',
      deathDate: '1968-12-20',
      timeline: [
        {
          location: {
            state: USState.CALIFORNIA,
            address: 'Salinas',
          },
          startDate: '1902-02-27',
          endDate: '1919',
        },
        {
          location: {
            state: USState.NEW_YORK,
            address: 'New York City',
          },
          startDate: '1968-12-20',
          endDate: '1968-12-20',
        },
      ],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/John_Steinbeck_1939_%28cropped%29.jpg/500px-John_Steinbeck_1939_%28cropped%29.jpg',
      },
    },
    {
      authorFirstName: 'Kurt',
      authorLastName: 'Vonnegut',
      authorFullName: 'Kurt Vonnegut, Jr',
      birthDate: '1922-11-11',
      deathDate: '2007-04-11',
      timeline: [
        {
          location: {
            state: USState.INDIANA,
            address: 'Indianapolis',
          },
          startDate: '1922-11-11',
          endDate: '1940',
        },
        {
          location: {
            state: USState.NEW_YORK,
            address: 'New York City',
          },
          startDate: '2007-04-11',
          endDate: '2007-04-11',
        },
      ],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg/330px-Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg',
      },
    },
  ];

  return <AuthorMap authors={hardcodedAuthors} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
