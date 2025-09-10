import { Author, StateStore, USState } from '../models';

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
    // Birth state
    const birthEvent = author.timeline.at(0);

    if (birthEvent && birthEvent.startDate === author.birthDate) {
      const store = map.get(birthEvent.location.state)!;

      store.bornAuthors.push(author);
    }

    // Death state
    const deathEvent = author.timeline.at(-1);

    if (deathEvent && deathEvent.endDate === author.deathDate) {
      const store = map.get(deathEvent.location.state)!;

      store.deceasedAuthors.push(author);
    }

    // Residing states
    author.timeline
      .filter((event) => event !== birthEvent && event !== deathEvent)
      .forEach((event) => {
        const store = map.get(event.location.state)!;

        if (!store.residingAuthors.includes(author)) {
          store.residingAuthors.push(author);
        }
      });
  }

  return map;
}
