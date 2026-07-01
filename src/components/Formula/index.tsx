import { Fragment, JSX, useMemo, useState } from 'react';
import { MdHelpOutline } from 'react-icons/md';
import Modal from 'react-modal';
import snakeCase from 'lodash-es/snakeCase';

import {
  AuthorInclusionReason,
  AuthorMapFormulaEquation,
  AuthorMapFormulaFilter,
  ScaleTransform,
  ValueTransform,
} from '../../models';

interface Props {
  value: AuthorMapFormulaFilter;

  onChange: (filter: AuthorMapFormulaFilter) => void;
}

export function Formula({ value, onChange }: Props): JSX.Element {
  const { equation, threshold } = value;
  const [helpOpened, setHelpOpened] = useState(false);

  const [thresholdId] = useMemo(() => ['author-formula-threshold'], []);

  const transformTypes: Array<{
    value: ValueTransform['type'];
    label: string;
  }> = [
    { value: 'scale', label: 'Scale' },
    { value: 'identity', label: 'None' },
    { value: 'tanh', label: 'Tanh' },
  ];

  const inputRows = Object.entries(equation).map(([reasonType, transform]) => {
    switch (reasonType as AuthorInclusionReason['type']) {
      case 'Because I said so; source: me':
        // skip
        return <Fragment key={reasonType} />;
      default:
        const inputId = `formula-${snakeCase(reasonType)}`;

        return (
          <div className="formulaRow" key={reasonType}>
            <label htmlFor={inputId}>{reasonType}</label>

            <select
              id={`${inputId}-select`}
              value={transform.type}
              onChange={(event) => {
                const newValue = structuredClone(value);

                const transformType = event.target
                  .value as ValueTransform['type'];

                let transform: ValueTransform;

                if (transformType === 'scale') {
                  transform = {
                    type: 'scale',
                    value: 1,
                  };
                } else {
                  transform = { type: transformType };
                }

                newValue.equation[reasonType as AuthorInclusionReason['type']] =
                  transform;

                onChange(newValue);
              }}
            >
              {transformTypes.map(({ value, label }) => {
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>

            {transform.type === 'scale' && (
              <input
                id={`${inputId}-scale`}
                className="formulaRowScale"
                value={transform.value}
                onChange={(event) => {
                  const scaleValue = Number(event.target.value);

                  if (scaleValue) {
                    const newValue = structuredClone(value);

                    (
                      newValue.equation[
                        reasonType as AuthorInclusionReason['type']
                      ] as ScaleTransform
                    ).value = scaleValue;

                    onChange(newValue);
                  }
                }}
              />
            )}
          </div>
        );
    }
  });

  return (
    <div className="formula">
      <button
        className="formulaHelp button"
        onClick={() => setHelpOpened(true)}
      >
        <MdHelpOutline />
      </button>

      {inputRows}

      <div className="formulaRow">
        <label htmlFor={thresholdId}>Threshold</label>
        <input
          id={thresholdId}
          className="formulaRowThreshold"
          type="number"
          value={value.threshold}
          onChange={(event) => {
            const thresholdValue = Number(event.target.value);

            if (thresholdValue) {
              onChange({
                ...value,
                threshold: thresholdValue,
              });
            }
          }}
        />
      </div>

      <Modal
        className="formulaHelpModal"
        isOpen={helpOpened}
        onRequestClose={() => setHelpOpened(false)}
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
          method is lacking. I am currently not working with a math parser for
          performance concerns.
        </p>
        <p>
          Scaling transforms are simple; "this value is twice as important as
          the other values."
        </p>
        <p>
          Tanh transforms are most useful for non-unique values i.e. appearing
          multiple times in a publisher's catalog. Tanh essentially caps the
          ultimate value to 1.
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
      </Modal>
    </div>
  );
}
