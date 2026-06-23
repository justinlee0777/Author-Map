import clsx from 'clsx';
import styles from './Radiogroup.module.css';

import { JSX, ReactNode } from 'react';

export type RadiogroupOptionRenderCallback = (props: {
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
}) => JSX.Element;

export type RadiogroupOptionRender = (
  callback: RadiogroupOptionRenderCallback,
) => JSX.Element;

export interface RadiogroupOption<T extends string> {
  label: string;
  value: T;

  render?: (callback: RadiogroupOptionRenderCallback) => JSX.Element;
}

interface Props<T extends string> {
  header: string;
  id: string;
  options: Array<RadiogroupOption<T>>;
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

      {options.map(({ value, label, render }) => {
        const componentFn: RadiogroupOptionRenderCallback = ({
          className,
          children,
          disabled,
        }) => {
          const radioId = `${id}-${value}-option`;

          return (
            <div key={value} className={clsx(className)}>
              <input
                type={type}
                id={radioId}
                value={value}
                checked={selectedValues.includes(value)}
                disabled={disabled}
                onChange={() => {
                  onChange?.(value);
                }}
              />
              <label className={styles.radioLabel} htmlFor={radioId}>
                {label}
              </label>
              {children}
            </div>
          );
        };

        if (render) {
          return render(componentFn);
        } else {
          return componentFn({});
        }
      })}
    </fieldset>
  );
}
