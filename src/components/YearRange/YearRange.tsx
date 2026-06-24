import { JSX, useMemo, useState } from 'react';

interface Props {
  /** Unique ID for the component. Will be used to construct the IDs for its child elements. */
  id: string;
  /** The earliest possible year to select. */
  startingYear: number;
  /** The latest possible year to select. */
  endingYear: number;

  onYearRangeChange: (startingYear: number, endingYear: number) => void;
}

/**
 * TODO: Finish this later.
 */
export function YearRange({
  id,
  startingYear,
  endingYear,
  onYearRangeChange,
}: Props): JSX.Element {
  const [startingYearId, endingYearId] = useMemo(
    () => [`${id}-starting-year`, `${id}-ending-year`],
    [id],
  );

  const [userStartingYear, setUserStartingYear] = useState(startingYear),
    [userEndingYear, setUserEndingYear] = useState(endingYear);

  const [startingYearOptions, endingYearOptions] = useMemo(() => {
    const uiOptions: Array<JSX.Element> = [];

    for (let i = startingYear; i <= endingYear; i++) {
      uiOptions.push(
        <option key={i} value={i}>
          {i}
        </option>,
      );
    }

    return [
      uiOptions,
      // This operates under the assumption "userStartingYear" is greater than "startingYear", which logically should hold.
      uiOptions.slice(userStartingYear - startingYear),
    ];
  }, [startingYear, endingYear, userStartingYear]);

  return (
    <div className="authorMapYearRange">
      <select
        id={startingYearId}
        value={userStartingYear}
        onChange={(event) => {
          if (event.currentTarget.value) {
            const year = Number(event.currentTarget.value);

            setUserStartingYear(year);
            onYearRangeChange(year, userEndingYear);
          }
        }}
      >
        {startingYearOptions}
      </select>
      <select
        id={endingYearId}
        value={userEndingYear}
        onChange={(event) => {
          if (event.currentTarget.value) {
            const year = Number(event.currentTarget.value);

            setUserEndingYear(year);
            onYearRangeChange(userStartingYear, year);
          }
        }}
      >
        {endingYearOptions}
      </select>
    </div>
  );
}
