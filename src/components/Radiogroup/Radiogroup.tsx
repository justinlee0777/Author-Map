import clsx from 'clsx';
import styles from './Radiogroup.module.css';

import { JSX } from 'react';

interface Props<T extends string> {
  header: string;
  id: string;
  options: Array<{ label: string; value: T }>;
  type: 'checkbox' | 'radio';

  className?: string;
  selected?: T | Array<T>;
  onChange?: (value: T) => void;
}

export function Radiogroup<T extends string>({
  header,
  id,
  options,
  type,
  className,
  selected,
  onChange,
}: Props<T>): JSX.Element {
  const selectedValues = selected ? ([] as Array<T>).concat(selected) : [];

  return (
    <fieldset id={id} className={clsx(styles.radiogroup, className)}>
      <legend>{header}</legend>

      {options.map(({ value, label }) => {
        const radioId = `${id}-${value}-option`;

        return (
          <div key={value}>
            <input
              type={type}
              id={radioId}
              value={value}
              checked={selectedValues.includes(value)}
              onChange={() => {
                onChange?.(value);
              }}
            />
            <label className={styles.radioLabel} htmlFor={radioId}>
              {label}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}
