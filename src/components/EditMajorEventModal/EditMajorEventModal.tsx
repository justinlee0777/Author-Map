import styles from './EditMajorEventModal.module.css';

import { JSX, useMemo, useState } from 'react';

import { Formik } from 'formik';
import { PulseLoader } from 'react-spinners';
import { MdClear } from 'react-icons/md';

import { BaseTimelineEvent, MilestoneEvent } from '../../models';
import { TimelineEvent } from '../EditAuthorModal/TimelineEvent/TimelineEvent';
import { Tooltip } from 'react-tooltip';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  appElement: HTMLElement;
  opened: boolean;

  disabled?: boolean | string;
  onSubmit?: (event: MilestoneEvent) => void | Promise<void>;
  onClose?: () => void;
  initialEvent?: Partial<MilestoneEvent>;
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

  const [referenceUrlId, tooltipId] = useMemo(
    () => ['major-event-reference-url', 'edit-major-event-modal-tooltip'],
    [],
  );

  return (
    <CommonModal opened={opened} appElement={appElement} onClose={onClose}>
      <Formik<Partial<MilestoneEvent>>
        initialValues={initialEvent}
        onSubmit={async (finalEvent) => {
          setLoading(true);

          try {
            await onSubmit?.(finalEvent as MilestoneEvent);
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

              <button
                type="submit"
                disabled={!isValid || Boolean(disabled) || loading}
                data-tooltip-id={tooltipId}
                data-tooltip-content={String(disabled)}
                data-tooltip-hidden={typeof disabled !== 'string'}
              >
                {loading ? <PulseLoader size="1em" /> : 'Submit'}
              </button>

              <Tooltip id={tooltipId} place="top" />
            </form>
          );
        }}
      </Formik>
    </CommonModal>
  );
}
