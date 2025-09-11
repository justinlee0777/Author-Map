import { Author, AuthorData, StateStore, USState } from '../models';
import { formatDate } from './dates';
import { getAuthorName } from './names';

export function createStores(authors: Array<Author>): Map<USState, StateStore> {
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
    const authorWithId: Omit<AuthorData, 'relevantFormattedDate'> = {
      ...author,
      id: Symbol(`ID for author ${getAuthorName(author)}`),
    };

    // Birth state
    const birthEvent = author.timeline.at(0);

    if (birthEvent && birthEvent.startDate === author.birthDate) {
      const state = birthEvent.location.state;
      const store = map.get(state)!;

      store.bornAuthors.push({
        ...authorWithId,
        relevantFormattedDate: formatDate(state, author.birthDate),
      });
    }

    // Death state
    const deathEvent = author.timeline.at(-1);

    if (deathEvent && deathEvent.endDate === author.deathDate) {
      const state = deathEvent.location.state;
      const store = map.get(state)!;

      store.deceasedAuthors.push({
        ...authorWithId,
        relevantFormattedDate: formatDate(state, author.deathDate),
      });
    }

    // Residing states
    author.timeline.forEach((event) => {
      const state = event.location.state;
      const store = map.get(state)!;

      const addedAuthor = store.residingAuthors.find(
        (residingAuthor) => residingAuthor.id === authorWithId.id,
      );

      const formattedDateRange = `${formatDate(state, event.startDate)} - ${formatDate(state, event.endDate)}`;

      if (addedAuthor) {
        addedAuthor.relevantFormattedDate = `${addedAuthor.relevantFormattedDate}, ${formattedDateRange}`;
      } else {
        store.residingAuthors.push({
          ...authorWithId,
          relevantFormattedDate: formattedDateRange,
        });
      }
    });
  }

  return map;
}
