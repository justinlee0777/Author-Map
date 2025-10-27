import commonStyles from '../../common.module.css';
import styles from './Tabs.module.css';

import clsx from 'clsx';
import { JSX } from 'react';

interface Props<T extends string> {
  values: Array<{ value: T; label: string }>;

  highlightedValue?: T;
  className?: string;
  onChange?: (value: T | null) => void;
}

export function Tabs<T extends string>({
  className,
  highlightedValue,
  values,
  onChange,
}: Props<T>): JSX.Element {
  return (
    <div className={clsx(styles.tabs, className)}>
      {values.map(({ label, value }) => {
        const isHighlighted = highlightedValue === value;

        return (
          <button
            key={value}
            className={clsx(commonStyles.button, {
              [styles.highlightedTab]: isHighlighted,
            })}
            onClick={() => {
              if (isHighlighted) {
                onChange?.(null);
              } else {
                onChange?.(value);
              }
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
