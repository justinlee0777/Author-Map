import { JSX, useMemo, useState } from 'react';
import { MdHelpOutline } from 'react-icons/md';

import { AuthorMapFormulaFilter } from '../../models';
import { evaluateFormula, mathDocumentation } from '../../utils/formula';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  value: AuthorMapFormulaFilter;

  onChange: (filter: AuthorMapFormulaFilter) => void;
}

export function Formula({ value, onChange }: Props): JSX.Element {
  const { equation, threshold } = value;
  const [helpOpened, setHelpOpened] = useState(false);

  const [equationId, thresholdId] = useMemo(
    () => ['author-formula-equation', 'author-formula-threshold'],
    [],
  );

  return (
    <div className="formula">
      <button
        className="formulaHelp button"
        onClick={() => setHelpOpened(true)}
      >
        <MdHelpOutline />
      </button>

      <div className="formulaRow">
        <label htmlFor={equationId}>Equation</label>
        <textarea
          id={equationId}
          value={equation}
          onChange={(event) => {
            onChange({
              ...value,
              equation: event.target.value,
            });
          }}
        />
      </div>

      {!evaluateFormula(equation) && (
        <p className="formulaInvalidMessage">
          Formula invalid. See help for rules.
        </p>
      )}

      <div className="formulaRow">
        <label htmlFor={thresholdId}>Threshold</label>
        <input
          id={thresholdId}
          className="formulaRowThreshold"
          type="number"
          value={threshold}
          onChange={(event) => {
            const thresholdValue = Number(event.target.value);

            if (!isNaN(thresholdValue)) {
              onChange({
                ...value,
                threshold: thresholdValue,
              });
            }
          }}
        />
      </div>

      <CommonModal
        className="formulaHelpModal"
        opened={helpOpened}
        onClose={() => setHelpOpened(false)}
      >
        <p>
          The intent of this project was not to settle on hard criteria to
          determine canonicity.
        </p>
        <p>
          Rather, it was to consider the variables that seem to correlate with
          canonicity.
        </p>
        <p>
          In one's own analysis, one may want to consider all variables, but
          weigh one over the other.
        </p>
        <p>
          I have provided a rudimentary way to assign "values" to an author and
          a filter to remove authors who do not fit that threshold.
        </p>
        <p>
          There are innumerable ways to make a calculation, so forgive me if a
          method is lacking. I am working with a math parser, but I have limited
          it to basic arithmetic and trigonometric functions (sin, cos, tan,
          sinh, etc).
        </p>
        <p>
          For context, each entry in a catalog and award count as 1, so the
          transforms become quite useful when trying to control noise.
        </p>
        <p>
          Hopefully this leads to interesting debate on who does and does not
          match certain criteria.
        </p>
        <p>
          This filter is populated with my own formula, but I am not saying this
          formula is "correct"; it is simply a starting point.
        </p>
        <p>
          That being said, there is a hidden, inalterable calculation - for some
          authors, I include them because they strike me as well-known though
          they are not recorded. Since their inclusion is biased, they are
          struck as "0". If ever they appear under some criteria, they will be
          stripped of this "Me" category and will thenceforth be calculated
          correctly.
        </p>
        <p>
          Reference:
          <code>{mathDocumentation}</code>
        </p>
      </CommonModal>
    </div>
  );
}
