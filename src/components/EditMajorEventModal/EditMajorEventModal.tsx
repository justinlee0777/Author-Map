import styles from './EditMajorEventModal.module.css';

import { JSX, useMemo, useState } from 'react';

import { Formik } from 'formik';
import Modal from 'react-modal';
import { PulseLoader } from 'react-spinners';
import { MdClear } from 'react-icons/md';

import { BaseTimelineEvent, MajorEvent } from '../../models';
import { TimelineEvent } from '../EditAuthorModal/TimelineEvent/TimelineEvent';

interface Props {
  appElement: HTMLElement;
  opened: boolean;

  disabled?: boolean;
  onSubmit?: (event: MajorEvent) => void | Promise<void>;
  onClose?: () => void;
  initialEvent?: Partial<MajorEvent>;
}

export function EditMajorEventModal({
  appElement,
  opened,
  disabled,
  onSubmit,
  onClose,
  initialEvent = {},
}: Props): JSX.Element {
  const [loading, setLoading] = useState(false);

  const [referenceUrlId] = useMemo(() => ['major-event-reference-url'], []);

  return (
    <Modal isOpen={opened} appElement={appElement}>
      <Formik<Partial<MajorEvent>>
        initialValues={initialEvent}
        onSubmit={async (finalEvent) => {
          setLoading(true);

          try {
            await onSubmit?.(finalEvent as MajorEvent);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ handleSubmit, values, handleChange, setFieldValue, isValid }) => {
          return (
            <form className={styles.editMajorEventForm} onSubmit={handleSubmit}>
              <button
                className={styles.editMajorEventCloseModal}
                type="button"
                onClick={onClose}
              >
                <MdClear />
              </button>

              <TimelineEvent
                id="major-event"
                dateKeys={[
                  {
                    keyName: 'date',
                    label: 'Date',
                  },
                ]}
                required
                forceRequire={{
                  notes: true,
                }}
                item={values as BaseTimelineEvent}
                setFieldValue={setFieldValue}
                handleChange={handleChange}
              />

              <label htmlFor={referenceUrlId}>Reference URL</label>
              <input
                id={referenceUrlId}
                name="referenceUrl"
                value={values.referenceUrl}
                onChange={handleChange}
                type="url"
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
