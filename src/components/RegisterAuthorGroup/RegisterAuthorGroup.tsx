import commonStyles from '../../common.module.css';
import styles from './RegisterAuthorGroup.module.css';

import { JSX, useMemo, useState } from 'react';
import { AuthorGroup } from '../../models';
import { DatePicker } from '../DatePicker/DatePicker';
import clsx from 'clsx';

interface Props {
  id: string;
  value: Partial<AuthorGroup>;

  disabled?: boolean;
  onChange?: (value: Partial<AuthorGroup>) => void;
  onSubmit?: (value: AuthorGroup) => void;
}

export function RegisterAuthorGroup({
  id,
  value: authorGroup,
  disabled,
  onChange,
  onSubmit,
}: Props): JSX.Element {
  const [nameId, descriptionId, timespanStartId, timespanEndId, linkId] =
    useMemo(
      () => [
        `${id}-name-input`,
        `${id}-description-input`,
        `${id}-timespan-start`,
        `${id}-timespan-end`,
        `${id}-link-input`,
      ],
      [id],
    );

  const [validity, setValidity] = useState<{
    name: boolean;
    description: boolean;
    spanStart: boolean;
    spanEnd: boolean;
  }>({
    name: false,
    description: false,
    spanStart: false,
    spanEnd: false,
  });

  const inputsValid = Object.values(validity).every((value) => value);

  return (
    <div className={styles.registerAuthorGroup}>
      <label htmlFor={nameId}>Name *</label>
      <input
        ref={(inputElement) => {
          if (inputElement) {
            setValidity((currentValidity) => {
              const validityValue = inputElement.checkValidity() ?? false;

              if (currentValidity.name !== validityValue) {
                return {
                  ...currentValidity,
                  name: validityValue,
                };
              } else {
                return currentValidity;
              }
            });
          }
        }}
        id={nameId}
        name="name"
        required
        disabled={disabled}
        value={authorGroup.name}
        onInput={(event) =>
          onChange?.({
            ...authorGroup,
            name: event.currentTarget.value,
          })
        }
      />

      <label htmlFor={descriptionId}>Description *</label>
      <textarea
        ref={(inputElement) => {
          if (inputElement) {
            setValidity((currentValidity) => {
              const validityValue = inputElement.checkValidity() ?? false;

              if (currentValidity.description !== validityValue) {
                return {
                  ...currentValidity,
                  description: validityValue,
                };
              } else {
                return currentValidity;
              }
            });
          }
        }}
        id={descriptionId}
        name="description"
        required
        value={authorGroup.description}
        disabled={disabled}
        onInput={(event) =>
          onChange?.({
            ...authorGroup,
            description: event.currentTarget.value,
          })
        }
      />

      <label htmlFor={timespanStartId}>Start Date</label>
      <DatePicker
        ref={({ isValid }) => {
          setValidity((currentValidity) => {
            if (currentValidity.spanStart !== isValid) {
              return {
                ...currentValidity,
                spanStart: isValid,
              };
            } else {
              return currentValidity;
            }
          });
        }}
        id={timespanStartId}
        disabled={disabled}
        value={authorGroup.span?.startDate}
        onChange={(value) => {
          onChange?.({
            ...authorGroup,
            span: {
              ...authorGroup.span,
              startDate: value,
            } as AuthorGroup['span'],
          });
        }}
      />

      <label htmlFor={timespanEndId}>End Date</label>
      <DatePicker
        ref={({ isValid }) => {
          setValidity((currentValidity) => {
            if (currentValidity.spanEnd !== isValid) {
              return {
                ...currentValidity,
                spanEnd: isValid,
              };
            } else {
              return currentValidity;
            }
          });
        }}
        id={timespanEndId}
        disabled={disabled}
        value={authorGroup.span?.endDate}
        onChange={(value) => {
          onChange?.({
            ...authorGroup,
            span: {
              ...authorGroup.span,
              endDate: value,
            } as AuthorGroup['span'],
          });
        }}
      />

      <label>Reference URL</label>
      <input
        id={linkId}
        name="link"
        type="url"
        disabled={disabled}
        onInput={(event) =>
          onChange?.({
            ...authorGroup,
            link: event.currentTarget.value,
          })
        }
        value={authorGroup.link}
      />

      <button
        className={clsx(commonStyles.button, styles.registerAuthorGroupCreate)}
        type="button"
        onClick={() => {
          const { span, ...authorGroupAttributes } = authorGroup;

          if (span && Object.values(span).every(Boolean)) {
            onSubmit?.(authorGroup as AuthorGroup);
          } else {
            onSubmit?.({ ...authorGroupAttributes } as AuthorGroup);
          }
        }}
        disabled={disabled || !inputsValid}
      >
        {authorGroup.id ? 'Update' : 'Create'}
      </button>
    </div>
  );
}
