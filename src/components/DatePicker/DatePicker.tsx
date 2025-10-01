import { monthOptions } from '../../models';
import styles from './DatePicker.module.css';

import { InputHTMLAttributes, JSX, ReactNode, useMemo, useState } from 'react';

interface Props
  extends Pick<InputHTMLAttributes<HTMLInputElement>, 'required'> {
  /** ISO datestring - YYYY-MM-DD. */
  value?: string;

  id: string;

  onChange: (value: string) => void;
}

export function DatePicker({
  value,
  id,
  onChange,
  required,
}: Props): JSX.Element {
  const [dayKnown, setDayKnown] = useState<boolean>(() => {
    return /\d{4}-\d{2}-\d{2}/.test(value ?? '');
  });

  const [fullDateId, monthId, yearId] = useMemo(
    () => [`${id}-full-date`, `${id}-month`, `${id}-year`],
    [],
  );

  let inputs: ReactNode;

  if (dayKnown) {
    inputs = (
      <div className={styles.column}>
        <input
          id={fullDateId}
          type="date"
          value={value}
          required={required}
          onChange={(event) => {
            const dateValue = event.target.value;

            onChange(dateValue);
          }}
        />
      </div>
    );
  } else {
    const dateRegex = /(\d{4})(?:-(\d{2}))?/;

    let year: string = '',
      month: string = '';

    if (value) {
      const result = dateRegex.exec(value);

      if (result) {
        [, year, month] = result;
      }
    }

    inputs = (
      <>
        <div className={styles.column}>
          <label htmlFor={yearId}>Year</label>
          <input
            id={yearId}
            type="text"
            required={required}
            value={year}
            pattern="^[1-2][0-9][0-9][0-9]$"
            title="Only years between 1000 and 2999 are allowed, inclusive."
            onChange={(event) => {
              event.preventDefault();

              const yearValue = event.target.value.padStart(4, '0');

              const finalDate = month ? `${yearValue}-${month}` : yearValue;

              onChange(finalDate);
            }}
          />
          <p className={styles.hint}>
            Only years between 1000 and 2999 are allowed, inclusive.
          </p>
        </div>

        <div className={styles.column}>
          <label htmlFor={monthId}>Month</label>
          <select
            id={monthId}
            value={month}
            onChange={(event) => onChange(`${year}-${event.target.value}`)}
          >
            <option></option>
            {monthOptions.map(({ label, value }) => {
              return (
                <option key={value} value={value.toString().padStart(2, '0')}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </>
    );
  }

  return (
    <div className={styles.datePicker}>
      {inputs}

      <div className={styles.dateKnown}>
        <input
          type="checkbox"
          checked={dayKnown}
          onChange={(event) => setDayKnown(event.target.checked)}
        />
        <label>I know the exact date</label>
      </div>
    </div>
  );
}
