import styles from './TimelineEvent.module.css';

import { ChangeEvent, Fragment, JSX, ReactNode, useMemo } from 'react';

import {
  AuthorAchievementType,
  BaseTimelineEvent,
  USState,
} from '../../../models';
import { DatePicker } from '../../DatePicker/DatePicker';

interface Props {
  dateKeys: Array<{
    keyName: string;
    label: string;
  }>;
  id: string;
  fieldName?: string;
  item: BaseTimelineEvent;
  setFieldValue: (fieldName: string, value: any) => void;
  handleChange: (e: ChangeEvent) => void;

  children?: {
    header?: ReactNode;
  };
  headerText?: string;
  required?: boolean;
  forceRequire?: {
    notes?: boolean;
  };
  hide?: {
    achievement?: boolean;
  };
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
  forceRequire,
  hide,
}: Props): JSX.Element {
  const keyPrefix = fieldName ? `${fieldName}.` : '';

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
            setFieldValue(`${keyPrefix}${keyName}`, newValue)
          }
        />
      </Fragment>
    );
  });

  const [
    stateId,
    addressId,
    notesId,
    achievementId,
    achievementBookId,
    achievementAwardId,
    achievementTypeId,
  ] = useMemo(
    () => [
      `${id}-state`,
      `${id}-address`,
      `${id}-notes`,
      `${id}-achievement`,
      `${id}-achievement-book-title`,
      `${id}-achievement-award-title`,
      `${id}-achievement-type`,
    ],
    [id],
  );

  let achievementElements: JSX.Element | undefined;

  if (item.achievement) {
    achievementElements = (
      <>
        <label htmlFor={achievementTypeId}>Type of Achievement</label>
        <select
          id={achievementTypeId}
          name={`${keyPrefix}achievement.type`}
          value={item.achievement.type}
          onChange={handleChange}
        >
          {Object.values(AuthorAchievementType).map((achievementType) => {
            return (
              <option key={achievementType} value={achievementType}>
                {achievementType}
              </option>
            );
          })}
        </select>
      </>
    );

    switch (item.achievement.type) {
      case AuthorAchievementType.AWARD:
        achievementElements = (
          <>
            {achievementElements}
            <label htmlFor={achievementAwardId}>Award</label>
            <input
              id={achievementBookId}
              name={`${keyPrefix}achievement.awardName`}
              value={item.achievement.awardName}
              onChange={handleChange}
              type="text"
              required
            />
          </>
        );
        break;
      case AuthorAchievementType.BOOK:
      default:
        achievementElements = (
          <>
            {achievementElements}
            <label htmlFor={achievementBookId}>Book title</label>
            <input
              id={achievementBookId}
              name={`${keyPrefix}achievement.bookTitle`}
              value={item.achievement.bookTitle}
              onChange={handleChange}
              type="text"
              required
            />
          </>
        );
        break;
    }
  }

  return (
    <div id={id} className={styles.timelineEvent}>
      <h4>
        {headerText} {children?.header}
      </h4>

      <label htmlFor={stateId}>State</label>
      <select
        id={stateId}
        name={`${keyPrefix}location.state`}
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
        name={`${keyPrefix}location.address`}
        type="text"
        value={item.location?.address}
        onChange={handleChange}
      />
      <p className={styles.hint}>
        The address can be partial. For example, the vast majority of locations
        will only have city.
      </p>

      {dateFields}

      {!hide?.achievement && (
        <>
          <div className={styles.timelineEventAchievement}>
            <input
              id={achievementId}
              name={`${keyPrefix}achievement`}
              checked={Boolean(item.achievement)}
              onChange={(event) => {
                if (event.target.checked) {
                  setFieldValue(event.target.name, {
                    type: AuthorAchievementType.BOOK,
                  });
                } else {
                  setFieldValue(event.target.name, undefined);
                }
              }}
              type="checkbox"
            />
            <label htmlFor={achievementId}>
              Is this considered an achievement?
            </label>
          </div>

          {achievementElements}
        </>
      )}

      <label htmlFor={notesId}>Notes</label>
      <textarea
        id={notesId}
        name={`${keyPrefix}notes`}
        value={item.notes}
        onChange={handleChange}
        required={forceRequire?.notes}
        rows={2}
      />
    </div>
  );
}
