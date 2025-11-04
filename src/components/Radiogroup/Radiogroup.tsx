import styles from './Radiogroup.module.css';

import { JSX } from 'react';

interface Props<T extends string> {
  header: string;
  id: string;
  options: Array<{ label: string; value: T }>;

  selected?: T;
  onChange?: (value: T) => void;
}

export function Radiogroup<T extends string>({
  header,
  id,
  options,
  selected,
  onChange,
}: Props<T>): JSX.Element {
  return (
    <fieldset id={id} className={styles.radiogroup}>
      <legend>{header}</legend>

      {options.map(({ value, label }) => {
        const radioId = `${id}-${value}-option`;

        return (
          <div key={value}>
            <input
              type="radio"
              id={radioId}
              value={value}
              checked={selected === value}
              onChange={() => onChange?.(value)}
            />
            <label htmlFor={radioId}>{label}</label>
          </div>
        );
      })}
    </fieldset>
  );
}
