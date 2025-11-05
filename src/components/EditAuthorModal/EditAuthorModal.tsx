import styles from './EditAuthorModal.module.css';

import { JSX, useMemo, useState } from 'react';

import { Formik, useFormikContext } from 'formik';
import Modal from 'react-modal';
import { PulseLoader } from 'react-spinners';

import {
  Author,
  BaseTimelineEvent,
  MilestoneEvent,
  TimelineEvent,
} from '../../models';
import { DynamicList, ItemProps } from '../DynamicList/DynamicList';
import { MdClear } from 'react-icons/md';
import { TimelineEvent as TimelineEventComponent } from './TimelineEvent/TimelineEvent';

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
    authorDisplayedNameId,
    birthDateId,
    deathDateId,
    referenceUrlId,
    deceasedId,
  ] = useMemo(
    () => [
      'portraitInput',
      'authorFirstNameInput',
      'authorLastNameInput',
      'authorFullNameInput',
      'authorDisplayNameInput',
      'birthDateInput',
      'deathDateInput',
      'referenceUrlInput',
      'deceasedInput',
    ],
    [],
  );

  const TimelineEventField: (props: TimelineEventProps) => JSX.Element =
    useMemo(() => {
      return ({ item, index, RemoveButton }) => {
        const { handleChange, setFieldValue } = useFormikContext<Author>();

        const inputId = `timeline-event-${index}`;

        return (
          <TimelineEventComponent
            id={inputId}
            required={true}
            dateKeys={[
              { keyName: 'startDate', label: 'Start Date' },
              { keyName: 'endDate', label: 'End Date' },
            ]}
            RemoveButton={() => <RemoveButton item={item} index={index} />}
            headerText="Event"
            fieldName={`timeline.${index}`}
            item={item as BaseTimelineEvent}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
          />
        );
      };
    }, []);

  const BirthField: ({ item }: { item: MilestoneEvent }) => JSX.Element =
    useMemo(() => {
      return ({ item }) => {
        const { handleChange, setFieldValue } = useFormikContext<Author>();

        return (
          <TimelineEventComponent
            id={birthDateId}
            required={true}
            dateKeys={[{ keyName: 'date', label: 'Date' }]}
            headerText="Birth"
            fieldName="birthDate"
            item={item as BaseTimelineEvent}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
          />
        );
      };
    }, []);

  const DeathField: ({ item }: { item: MilestoneEvent }) => JSX.Element =
    useMemo(() => {
      return ({ item }) => {
        const { handleChange, setFieldValue } = useFormikContext<Author>();

        return (
          <TimelineEventComponent
            id={deathDateId}
            required={true}
            dateKeys={[{ keyName: 'date', label: 'Date' }]}
            headerText="Death"
            fieldName="deathDate"
            item={item as BaseTimelineEvent}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
          />
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
                className={styles.editAuthorCloseModal}
                type="button"
                onClick={onClose}
              >
                <MdClear />
              </button>
              <div className={styles.editAuthorPortraitRow}>
                <div className={styles.editAuthorPortraitContainer}>
                  {values.portrait?.src && <img src={values.portrait?.src} />}
                </div>
                <div className={styles.editAuthorPortraitDetails}>
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

              <label htmlFor={authorDisplayedNameId}>
                Displayed author name
              </label>
              <input
                id={authorDisplayedNameId}
                type="text"
                name="authorDisplayName"
                value={values.authorDisplayName}
                onChange={handleChange}
              />

              <label htmlFor={referenceUrlId}>Reference URL</label>
              <input
                id={referenceUrlId}
                type="text"
                name="link"
                value={values.link}
                onChange={handleChange}
              />

              <BirthField item={values.birthDate!} />

              <div className={styles.editAuthorDeceasedRow}>
                <input
                  id={deceasedId}
                  type="checkbox"
                  checked={Boolean(values.deathDate)}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setFieldValue('deathDate', {
                        date: '',
                        location: {
                          address: '',
                        },
                      });
                    } else {
                      setFieldValue('deathDate', undefined);
                    }
                  }}
                />
                <label htmlFor={deceasedId}>Deceased?</label>
              </div>

              {values.deathDate && <DeathField item={values.deathDate!} />}

              <label className={styles.editAuthorTimelineLabel}>Timeline</label>
              <DynamicList<Partial<TimelineEvent>>
                classes={{
                  component: styles.editAuthorTimelineEventsContainer,
                  listItems: styles.editAuthorTimelineEvents,
                }}
                items={values.timeline ?? []}
                ItemTemplate={TimelineEventField}
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

              <button type="submit" disabled={!isValid || disabled || loading}>
                {loading ? <PulseLoader size="1em" /> : 'Submit'}
              </button>
            </form>
          );
        }}
      </Formik>
    </Modal>
  );
}
