import {
  AmericanLiteraryAward,
  Author,
  AuthorInclusionReason,
  AuthorMapFormulaEquation,
  AwardInclusionReason,
  ClassicPublisher,
} from '../models';
import { math } from '../consts/math.const';

function createMathContext(
  reasonCounts: { [reasonType in AuthorInclusionReason['type']]: number },
  awardCounts: { [awardType in AmericanLiteraryAward]: number },
  catalogCounts: { [catalogType in ClassicPublisher]: number },
) {
  return {
    a: reasonCounts['Published as classical literature'],
    a1: catalogCounts['Dalkey Archive Press'],
    a2: catalogCounts['Library of America'],
    a3: catalogCounts['NYRB'],
    a4: catalogCounts['Norton'],
    a5: catalogCounts['Penguin Classic'],
    b: reasonCounts.award,
    b1: awardCounts['National Book Award for Fiction'],
    b2: awardCounts['National Book Award for Poetry'],
    b3: awardCounts['Nobel Prize in Literature'],
    b4: awardCounts['Pulitzer Prize for Fiction'],
    b5: awardCounts['Pulitzer Prize for Poetry'],
    c: reasonCounts['Belongs to a renowned group'],
    d: reasonCounts['Poet Laureate'],
  };
}

const mathContextString = createMathContext.toString();

export const mathDocumentation = mathContextString
  .slice(mathContextString.indexOf('{') + 1, mathContextString.lastIndexOf('}'))
  .trim();

export function calculateScore(
  reasons: Author['inclusionReasons'],
  formula: AuthorMapFormulaEquation,
): number | null {
  const reasonCounts: {
    [reasonType in AuthorInclusionReason['type']]: number;
  } = {
    'Because I said so; source: me': 0,
    'Published as classical literature': 0,
    'Poet Laureate': 0,
    'Belongs to a renowned group': 0,
    award: 0,
  };

  const awardCounts: { [awardType in AmericanLiteraryAward]: number } = {
    [AmericanLiteraryAward.NATIONAL_BOOK_FICTION]: 0,
    [AmericanLiteraryAward.NATIONAL_BOOK_POETRY]: 0,
    [AmericanLiteraryAward.NOBEL_PRIZE_IN_LITERATURE]: 0,
    [AmericanLiteraryAward.PULITZER_FICTION]: 0,
    [AmericanLiteraryAward.PULITZER_POETRY]: 0,
  };

  const catalogCounts: { [catalogType in ClassicPublisher]: number } = {
    [ClassicPublisher.DALKEY]: 0,
    [ClassicPublisher.LIBRARY_OF_AMERICA]: 0,
    [ClassicPublisher.NORTON]: 0,
    [ClassicPublisher.NYRB]: 0,
    [ClassicPublisher.PENGUIN_CLASSIC]: 0,
  };

  for (const reason of reasons) {
    switch (reason.type) {
      case 'Because I said so; source: me':
        // As I am the source, these authors are automatically invalidated.
        return 0;
      case 'Belongs to a renowned group':
        reasonCounts['Belongs to a renowned group'] += 1;
        break;
      case 'Poet Laureate':
        reasonCounts['Poet Laureate'] += 1;
        break;
      case 'Published as classical literature':
        let totalCatalogCount = 0;

        for (const [publisher, catalog] of Object.entries(reason.publishers)) {
          const bookCount = catalog.books.length;

          catalogCounts[publisher as ClassicPublisher] = bookCount;

          totalCatalogCount += bookCount;
        }

        reasonCounts['Published as classical literature'] += totalCatalogCount;
        break;
      case 'award':
        reasonCounts['award'] += 1;
        awardCounts[reason.award] += 1;
        break;
    }
  }

  try {
    return math.evaluate(
      formula,
      createMathContext(reasonCounts, awardCounts, catalogCounts),
    );
  } catch {
    return null;
  }
}

export function evaluateFormula(formula: string): boolean {
  try {
    return (
      typeof math.evaluate(
        formula,
        createMathContext(
          {
            'Because I said so; source: me': 0,
            'Published as classical literature': 0,
            'Poet Laureate': 0,
            'Belongs to a renowned group': 0,
            award: 0,
          },
          {
            [AmericanLiteraryAward.NATIONAL_BOOK_FICTION]: 0,
            [AmericanLiteraryAward.NATIONAL_BOOK_POETRY]: 0,
            [AmericanLiteraryAward.NOBEL_PRIZE_IN_LITERATURE]: 0,
            [AmericanLiteraryAward.PULITZER_FICTION]: 0,
            [AmericanLiteraryAward.PULITZER_POETRY]: 0,
          },
          {
            [ClassicPublisher.DALKEY]: 0,
            [ClassicPublisher.LIBRARY_OF_AMERICA]: 0,
            [ClassicPublisher.NORTON]: 0,
            [ClassicPublisher.NYRB]: 0,
            [ClassicPublisher.PENGUIN_CLASSIC]: 0,
          },
        ),
      ) === 'number'
    );
  } catch {
    return false;
  }
}
