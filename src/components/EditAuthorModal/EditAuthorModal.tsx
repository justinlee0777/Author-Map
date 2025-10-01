import styles from './EditAuthorModal.module.css';

import { JSX, useMemo, useState } from 'react';

import { Formik, useFormikContext } from 'formik';
import Modal from 'react-modal';
import cloneDeep from 'lodash-es/cloneDeep';

import { Author, TimelineEvent, USState } from '../../models';
import { DynamicList, ItemProps } from '../DynamicList/DynamicList';
import { DatePicker } from '../DatePicker/DatePicker';
import { MdClear } from 'react-icons/md';

interface Props {
  appElement: HTMLElement;
  opened: boolean;

  disabled?: boolean;
  onSubmit?: (author: Author) => void | Promise<void>;
  onClose?: () => void;
  initialAuthor?: Partial<Author>;
}

interface TimelineEventProps extends ItemProps<Partial<TimelineEvent>> {}

export function EditAuthorModal({
  appElement,
  opened,
  disabled,
  onSubmit,
  onClose,
  initialAuthor = {},
}: Props): JSX.Element {
  const [loading, setLoading] = useState(false);

  const [
    portraitId,
    authorFirstNameId,
    authorLastNameId,
    authorFullNameId,
    birthDateId,
    deathDateId,
    referenceUrlId,
  ] = useMemo(
    () => [
      'portraitInput',
      'authorFirstNameInput',
      'authorLastNameInput',
      'authorFullNameInput',
      'birthDateInput',
      'deathDateInput',
      'referenceUrlInput',
    ],
    [],
  );

  const TimelineEventComponent: (props: TimelineEventProps) => JSX.Element =
    useMemo(() => {
      return ({ item, index, RemoveButton }) => {
        const { handleChange, setFieldValue, values } =
          useFormikContext<Author>();

        let header: string;

        if (index === 0) {
          header = 'Birth';
        } else if (values.deathDate && values.timeline.length - 1 === index) {
          header = 'Death';
        } else {
          header = 'Event';
        }

        const inputId = `timeline-event-${index}`;

        return (
          <div className={styles.timelineEvent}>
            <h4>
              {header} <RemoveButton item={item} index={index} />
            </h4>

            <label>State</label>
            <select
              name={`timeline.${index}.location.state`}
              required
              value={item.location?.state}
              onChange={handleChange}
            >
              {Object.values(USState).map((usState) => {
                return (
                  <option key={usState} value={usState}>
                    {usState}
                  </option>
                );
              })}
            </select>

            <label>Address</label>
            <input
              name={`timeline.${index}.location.state.address`}
              type="text"
              required
              value={item.location?.address}
              onChange={handleChange}
            />
            <p className={styles.hint}>
              The address can be partial. For example, the vast majority of
              locations will only have city.
            </p>

            <label>Start Date</label>
            <DatePicker
              id={`${inputId}-start`}
              value={item.startDate}
              required
              onChange={(newValue) =>
                setFieldValue(`timeline.${index}.startDate`, newValue)
              }
            />

            <label>End Date</label>
            <DatePicker
              id={`${inputId}-end`}
              value={item.endDate}
              required
              onChange={(newValue) =>
                setFieldValue(`timeline.${index}.endDate`, newValue)
              }
            />
          </div>
        );
      };
    }, []);

  return (
    <Modal isOpen={opened} appElement={appElement}>
      <Formik<Partial<Author>>
        initialValues={initialAuthor}
        onSubmit={async (finalAuthor) => {
          setLoading(true);

          try {
            await onSubmit?.(finalAuthor as Author);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ handleSubmit, values, handleChange, setFieldValue, isValid }) => {
          const timeline = values.timeline ?? [];

          return (
            <form className={styles.editAuthorForm} onSubmit={handleSubmit}>
              <button
                className={styles.closeModal}
                type="button"
                onClick={onClose}
              >
                <MdClear />
              </button>
              <div className={styles.portraitRow}>
                <img src={values.portrait?.src} />
                <div className={styles.portraitDetails}>
                  <label htmlFor={portraitId}>Portrait</label>
                  <input
                    id={portraitId}
                    type="text"
                    name="portrait.src"
                    value={values.portrait?.src}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label htmlFor={authorFirstNameId}>Author first name</label>
              <input
                id={authorFirstNameId}
                type="text"
                name="authorFirstName"
                value={values.authorFirstName}
                required
                onChange={handleChange}
              />

              <label htmlFor={authorLastNameId}>Author last name</label>
              <input
                id={authorLastNameId}
                type="text"
                name="authorLastName"
                value={values.authorLastName}
                required
                onChange={handleChange}
              />

              <label htmlFor={authorFullNameId}>Author full name</label>
              <input
                id={authorFullNameId}
                type="text"
                name="authorFullName"
                value={values.authorFullName}
                onChange={handleChange}
              />

              <label htmlFor={birthDateId}>Birth date</label>
              <DatePicker
                id={birthDateId}
                value={values.birthDate}
                required
                onChange={(newValue) => setFieldValue('birthDate', newValue)}
              />

              <label htmlFor={deathDateId}>Death date</label>
              <DatePicker
                id={deathDateId}
                value={values.deathDate}
                required
                onChange={(newValue) => setFieldValue('deathDate', newValue)}
              />

              <label htmlFor={referenceUrlId}>Reference URL</label>
              <input
                id={referenceUrlId}
                type="text"
                name="link"
                value={values.link}
                onChange={handleChange}
              />

              <label>Timeline</label>
              <DynamicList<Partial<TimelineEvent>>
                classes={{
                  component: styles.timelineEventsContainer,
                  listItems: styles.timelineEvents,
                }}
                items={values.timeline ?? []}
                ItemTemplate={TimelineEventComponent}
                trackItem={({ index }) => {
                  return index.toString();
                }}
                addText="Add event"
                onAdd={() => {
                  setFieldValue(
                    'timeline',
                    timeline.concat({} as TimelineEvent),
                  );
                }}
                onRemove={(index) => {
                  setFieldValue('timeline', [
                    ...values.timeline!.slice(0, index),
                    ...values.timeline!.slice(index + 1),
                  ]);
                }}
              />

              <button type="submit" disabled={!isValid || disabled}>
                Submit
              </button>
            </form>
          );
        }}
      </Formik>
    </Modal>
  );
}
