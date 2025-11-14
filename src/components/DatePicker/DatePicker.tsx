import { monthOptions } from '../../models';
import styles from './DatePicker.module.css';

import { InputHTMLAttributes, JSX, ReactNode, useMemo, useState } from 'react';

interface Props
  extends Pick<InputHTMLAttributes<HTMLInputElement>, 'required'> {
  /** ISO datestring - YYYY-MM-DD. */
  value?: string;

  id: string;

  onChange: (value: string) => void;

  disabled?: boolean;

  ref?: (state: { isValid: boolean }) => void;
}

export function DatePicker({
  value,
  id,
  onChange,
  required,
  disabled,
  ref,
}: Props): JSX.Element {
  const [dayKnown, setDayKnown] = useState<boolean>(() => {
    return /\d{4}-\d{2}-\d{2}/.test(value ?? '');
  });

  const [fullDateId, monthId, yearId, dateKnownId] = useMemo(
    () => [`${id}-full-date`, `${id}-month`, `${id}-year`, `${id}-date-known`],
    [id],
  );

  let inputs: ReactNode;

  if (dayKnown) {
    inputs = (
      <div className={styles.datePickerColumn}>
        <input
          id={fullDateId}
          type="date"
          value={value}
          required={required}
          disabled={disabled}
          onChange={(event) => {
            const dateValue = event.target.value;

            onChange(dateValue);
          }}
        />
      </div>
    );
  } else {
    let year: string = '',
      month: string = '';

    if (value) {
      [year = '', month = ''] = value.split('-');
    }

    inputs = (
      <>
        <div className={styles.datePickerColumn}>
          <label htmlFor={yearId}>Year</label>
          <input
            id={yearId}
            type="text"
            required={required}
            pattern="^[1-2][0-9][0-9][0-9]$"
            value={year}
            title="Only years between 1000 and 2999 are allowed, inclusive."
            disabled={disabled}
            onChange={(event) => {
              event.preventDefault();

              const yearValue = event.target.value;

              const finalDate = month ? `${yearValue}-${month}` : yearValue;

              onChange(finalDate);
            }}
          />
          <p className={styles.datePickerHint}>
            Only years between 1000 and 2999 are allowed, inclusive.
          </p>
        </div>

        <div className={styles.datePickerColumn}>
          <label htmlFor={monthId}>Month</label>
          <select
            id={monthId}
            value={month}
            onChange={(event) => onChange(`${year}-${event.target.value}`)}
            disabled={disabled}
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
    <div
      className={styles.datePicker}
      ref={(element) => {
        if (element && ref) {
          ref({
            isValid: [...(element.querySelectorAll('input') ?? [])].every(
              (inputElement) => inputElement.checkValidity(),
            ),
          });
        }
      }}
    >
      {inputs}

      <div className={styles.datePickerDateKnown}>
        <input
          id={dateKnownId}
          type="checkbox"
          checked={dayKnown}
          onChange={(event) => setDayKnown(event.target.checked)}
          disabled={disabled}
        />
        <label htmlFor={dateKnownId}>I know the exact date</label>
      </div>
    </div>
  );
}
