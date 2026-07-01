import {
  Author,
  AuthorInclusionReason,
  AuthorMapFormulaEquation,
} from '../models';

export function calculateScore(
  reasons: Author['inclusionReasons'],
  formula: AuthorMapFormulaEquation,
): number {
  let value = 0;

  const counts: { [reasonType in AuthorInclusionReason['type']]: number } = {
    'Because I said so; source: me': 0,
    'Published as classical literature': 0,
    'Poet Laureate': 0,
    'Belongs to a renowned group': 0,
    award: 0,
  };

  for (const reason of reasons) {
    switch (reason.type) {
      case 'Because I said so; source: me':
        // As I am the source, these authors are automatically invalidated.
        return 0;
      case 'Belongs to a renowned group':
        counts['Belongs to a renowned group'] += 1;
        break;
      case 'Poet Laureate':
        counts['Poet Laureate'] += 1;
        break;
      case 'Published as classical literature':
        const catalogCount = Object.values(reason.publishers)
          .map((catalog) => catalog.books)
          .flat();
        counts['Published as classical literature'] += catalogCount.length;
        break;
      case 'award':
        counts['award'] += 1;
        break;
    }
  }

  for (const [reasonType, count] of Object.entries(counts)) {
    const transform = formula[reasonType as AuthorInclusionReason['type']];

    let subValue = 0;

    switch (transform.type) {
      case 'identity':
        subValue = count;
        break;
      case 'scale':
        subValue = count * transform.value;
        break;
      case 'tanh':
        subValue = Math.tanh(count);
        break;
    }

    value += subValue;
  }

  return value;
}
