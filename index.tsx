import ReactDOM from 'react-dom/client';

import { AuthorMap } from './src/AuthorMap';
import { Author, AuthorGroup, USState } from './src/models';
import { useState } from 'react';

const App = () => {
  const [groups, setGroups] = useState<Array<AuthorGroup>>([
    {
      id: Symbol('ID for American Renaissance'),
      name: 'American Renaissance',
      description:
        'The American Renaissance period in American literature ran from about 1830 to around the Civil War. A central term in American studies, the American Renaissance was for a while considered synonymous with American Romanticism and was closely associated with Transcendentalism.',
      span: {
        startDate: '1830',
        endDate: '1860',
      },
    },
    {
      id: Symbol('ID for Harlem Renaissance'),
      name: 'Harlem Renaissance',
      description:
        'The Harlem Renaissance was an intellectual and cultural movement of African-American music, dance, art, fashion, literature, theater, politics, and scholarship centered in Harlem, Manhattan, New York City, spanning the 1920s and 1930s.',
      span: {
        startDate: '1918',
        endDate: '1929',
      },
    },
  ]);

  const [authors, setAuthors] = useState<Array<Author>>(() => [
    {
      id: Symbol('ID for Herman Melville'),
      authorFirstName: 'Herman',
      authorLastName: 'Melville',
      birthDate: {
        location: {
          state: USState.NEW_YORK,
          address: 'New York City',
        },
        date: '1819-08-01',
      },
      deathDate: {
        location: {
          state: USState.NEW_YORK,
          address: 'New York City',
        },
        date: '1891-09-28',
      },
      timeline: [],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Herman_Melville_by_Joseph_O_Eaton.jpg/500px-Herman_Melville_by_Joseph_O_Eaton.jpg',
      },
      groups: [groups[0]],
    },
    {
      id: Symbol('ID for Walt Whitman'),
      authorFirstName: 'Walt',
      authorLastName: 'Whitman',
      birthDate: {
        location: {
          state: USState.NEW_YORK,
          address: 'Huntington',
        },
        date: '1819-05-31',
      },
      deathDate: {
        location: {
          state: USState.NEW_JERSEY,
          address: 'Camden',
        },
        date: '1892-03-26',
      },
      timeline: [],
      link: 'https://en.wikipedia.org/wiki/Walt_Whitman',
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Walt_Whitman_-_George_Collins_Cox.jpg/500px-Walt_Whitman_-_George_Collins_Cox.jpg',
      },
      groups: [groups[0]],
    },
    {
      id: Symbol('ID for Gertrude Stein'),
      authorFirstName: 'Gertrude',
      authorLastName: 'Stein',
      birthDate: {
        location: {
          state: USState.PENNSYLVANIA,
          address: 'Allegheny',
        },
        date: '1874-02-03',
      },
      deathDate: {
        location: {
          address: 'Neuilly-sur-Seine, France',
        },
        date: '1946-07-27',
      },
      timeline: [],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Gertrude_Stein_1935-01-04.jpg/500px-Gertrude_Stein_1935-01-04.jpg',
      },
    },
    {
      id: Symbol('ID for Thomas Eliot'),
      authorFirstName: 'Thomas',
      authorLastName: 'Eliot',
      authorFullName: 'T. S. Eliot',
      birthDate: {
        location: {
          state: USState.MISSOURI,
          address: 'St. Louis',
        },
        date: '1888-09-26',
      },
      deathDate: {
        date: '1965-01-04',
        location: {
          address: 'London, England',
        },
      },
      timeline: [],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Thomas_Stearns_Eliot_by_Lady_Ottoline_Morrell_%281934%29.jpg',
      },
    },
    {
      id: Symbol('ID for Kurt Vonnegut'),
      authorFirstName: 'Kurt',
      authorLastName: 'Vonnegut',
      authorFullName: 'Kurt Vonnegut, Jr',
      birthDate: {
        location: {
          state: USState.INDIANA,
          address: 'Indianapolis',
        },
        date: '1922-11-11',
      },
      deathDate: {
        location: {
          state: USState.NEW_YORK,
          address: 'New York City',
        },
        date: '2007-04-11',
      },
      timeline: [],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg/330px-Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg',
      },
    },
    {
      id: Symbol('ID for John Steinbeck'),
      authorFirstName: 'John',
      authorLastName: 'Steinbeck',
      authorFullName: 'John Ernst Steinbeck',
      birthDate: {
        location: {
          state: USState.CALIFORNIA,
          address: 'Salinas',
        },
        date: '1902-02-27',
      },
      deathDate: {
        location: {
          state: USState.NEW_YORK,
          address: 'New York City',
        },
        date: '1968-12-20',
      },
      timeline: [],
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/John_Steinbeck_1939_%28cropped%29.jpg/500px-John_Steinbeck_1939_%28cropped%29.jpg',
      },
    },
  ]);

  return (
    <AuthorMap
      className="authorMap"
      authors={authors}
      groups={groups}
      syncAuthorUpdate={async (author) => {
        console.log('author updated', author);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
      syncAuthorAdded={(author) => {
        console.log('author added', author);

        author.id = Symbol();
      }}
      onGroupCreated={(group) =>
        setGroups((currentGroups) =>
          currentGroups.concat({
            ...group,
            id: Symbol(`Group ID for ${group.name}`),
          }),
        )
      }
    />
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
