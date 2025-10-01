import {
  Author,
  AuthorData,
  AuthorWithId,
  StateStore,
  USState,
} from '../models';
import { formatDate } from './dates';
import { getAuthorName } from './names';

export function transformAuthors(authors: Array<Author>): Array<AuthorWithId> {
  return authors.map((author) => ({
    ...author,
    id: Symbol(`ID for author ${getAuthorName(author)}`),
  }));
}

export function createStores(
  authors: Array<AuthorWithId>,
): Map<USState, StateStore> {
  const map = new Map<USState, StateStore>([
    ...Object.values(USState).map(
      (stateName) =>
        [
          stateName,
          { bornAuthors: [], deceasedAuthors: [], residingAuthors: [] },
        ] as [USState, StateStore],
    ),
  ]);

  for (const author of authors) {
    // Birth state
    const birthEvent = author.timeline.at(0);

    if (birthEvent && birthEvent.startDate === author.birthDate) {
      const state = birthEvent.location.state;
      const store = map.get(state)!;

      store.bornAuthors.push({
        ...author,
        relevantFormattedDate: formatDate(state, author.birthDate),
      });
    }

    // Death state
    const deathEvent = author.timeline.at(-1);

    if (deathEvent && deathEvent.endDate === author.deathDate) {
      const state = deathEvent.location.state;
      const store = map.get(state)!;

      store.deceasedAuthors.push({
        ...author,
        relevantFormattedDate: formatDate(state, author.deathDate),
      });
    }

    // Residing states
    author.timeline.forEach((event) => {
      const state = event.location.state;
      const store = map.get(state)!;

      const addedAuthor = store.residingAuthors.find(
        (residingAuthor) => residingAuthor.id === author.id,
      );

      const formattedDateRange = `${formatDate(state, event.startDate)} - ${formatDate(state, event.endDate)}`;

      if (addedAuthor) {
        addedAuthor.relevantFormattedDate = `${addedAuthor.relevantFormattedDate}, ${formattedDateRange}`;
      } else {
        store.residingAuthors.push({
          ...author,
          relevantFormattedDate: formattedDateRange,
        });
      }
    });
  }

  return map;
}
