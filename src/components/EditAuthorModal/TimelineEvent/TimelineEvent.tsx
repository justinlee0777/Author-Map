import styles from './TimelineEvent.module.css';

import { ChangeEvent, Fragment, JSX, ReactNode, useMemo } from 'react';

import { BaseTimelineEvent, USState } from '../../../models';
import { DatePicker } from '../../DatePicker/DatePicker';

interface Props {
  dateKeys: Array<{
    keyName: string;
    label: string;
  }>;
  id: string;
  fieldName: string;
  item: BaseTimelineEvent;
  setFieldValue: (fieldName: string, value: string) => void;
  handleChange: (e: ChangeEvent) => void;

  children?: {
    header?: ReactNode;
  };
  headerText?: string;
  required?: boolean;
}

export function TimelineEvent({
  id,
  item,
  dateKeys,
  fieldName,
  setFieldValue,
  handleChange,
  children,
  headerText = 'Event',
  required,
}: Props): JSX.Element {
  const dateFields = dateKeys.map(({ keyName, label }) => {
    const dateFieldId = `${id}-${keyName}`;

    return (
      <Fragment key={keyName}>
        <label htmlFor={dateFieldId}>{label}</label>
        <DatePicker
          id={dateFieldId}
          value={(item as any)[keyName]}
          required={required}
          onChange={(newValue) =>
            setFieldValue(`${fieldName}.${keyName}`, newValue)
          }
        />
      </Fragment>
    );
  });

  const [stateId, addressId, notesId] = useMemo(
    () => [`${id}-state`, `${id}-address`, `${id}-notes`],
    [id],
  );

  return (
    <div id={id} className={styles.timelineEvent}>
      <h4>
        {headerText} {children?.header}
      </h4>

      <label htmlFor={stateId}>State</label>
      <select
        id={stateId}
        name={`${fieldName}.location.state`}
        value={item.location?.state}
        onChange={handleChange}
      >
        <option></option>
        {Object.values(USState).map((usState) => {
          return (
            <option key={usState} value={usState}>
              {usState}
            </option>
          );
        })}
      </select>

      <label htmlFor={addressId}>Address</label>
      <input
        id={addressId}
        name={`${fieldName}.location.address`}
        type="text"
        value={item.location?.address}
        onChange={handleChange}
      />
      <p className={styles.hint}>
        The address can be partial. For example, the vast majority of locations
        will only have city.
      </p>

      {dateFields}

      <label htmlFor={notesId}>Notes</label>
      <textarea
        id={notesId}
        name={`${fieldName}.notes`}
        value={item.notes}
        onChange={handleChange}
        rows={2}
      />
    </div>
  );
}
