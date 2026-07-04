import { JSX, useMemo } from 'react';

interface Props {
  /** Unique ID for the component. Will be used to construct the IDs for its child elements. */
  id: string;
  /** The earliest possible year to select. */
  startingYear: number;
  /** The latest possible year to select. */
  endingYear: number;

  value: [number, number];

  onYearRangeChange: (startingYear: number, endingYear: number) => void;
}

export function YearRange({
  id,
  startingYear,
  endingYear,
  value: [userStartingYear, userEndingYear],
  onYearRangeChange,
}: Props): JSX.Element {
  const [startingYearId, endingYearId] = useMemo(
    () => [`${id}-starting-year`, `${id}-ending-year`],
    [id],
  );

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
      uiOptions.slice(0, userEndingYear - endingYear - 1),
      // This operates under the assumption "userStartingYear" is greater than "startingYear", which logically should hold.
      uiOptions.slice(userStartingYear - startingYear),
    ];
  }, [startingYear, endingYear, userStartingYear, userEndingYear]);

  return (
    <div className="authorMapYearRange">
      <select
        id={startingYearId}
        value={userStartingYear}
        onChange={(event) => {
          if (event.currentTarget.value) {
            const year = Number(event.currentTarget.value);

            let finalEndYear = userEndingYear;
            if (year > finalEndYear) {
              finalEndYear = year;
            }

            onYearRangeChange(year, finalEndYear);
          }
        }}
      >
        {startingYearOptions}
      </select>

      <span> - </span>

      <select
        id={endingYearId}
        value={userEndingYear}
        onChange={(event) => {
          if (event.currentTarget.value) {
            const year = Number(event.currentTarget.value);

            onYearRangeChange(userStartingYear, year);
          }
        }}
      >
        {endingYearOptions}
      </select>
    </div>
  );
}
