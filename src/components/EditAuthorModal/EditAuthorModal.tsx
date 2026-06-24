import { JSX, useMemo, useState } from 'react';

import { Formik, useFormikContext } from 'formik';
import { PulseLoader } from 'react-spinners';

import {
  Author,
  AuthorData,
  AuthorGroup,
  AuthorTimelineEvent,
  BaseTimelineEvent,
  BirthEvent,
  DeathEvent,
} from '../../models';
import { DynamicList, ItemProps } from '../DynamicList/DynamicList';
import { MdClear } from 'react-icons/md';
import { TimelineEvent as TimelineEventComponent } from './TimelineEvent/TimelineEvent';
import { AuthorGroupInput } from '../AuthorGroupInput/AuthorGroupInput';
import { Tooltip } from 'react-tooltip';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  appElement: HTMLElement;
  opened: boolean;
  initialData: RecursivePartial<AuthorData>;

  disabled?: boolean | string;
  onSubmit?: (data: AuthorData) => void | Promise<void>;
  onClose?: () => void;
  onGroupCreated?: (authorGroup: AuthorGroup) => void | Promise<void>;
}

interface TimelineEventProps
  extends ItemProps<RecursivePartial<AuthorTimelineEvent>> {}

export function EditAuthorModal({
  appElement,
  opened,
  disabled,
  onSubmit,
  onClose,
  onGroupCreated,
  initialData,
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
    tooltipId,
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
      'editAuthorModalTooltip',
    ],
    [],
  );

  const TimelineEventField: (props: TimelineEventProps) => JSX.Element =
    useMemo(() => {
      return ({ item, index, RemoveButton }) => {
        const { values, handleChange, setFieldValue } =
          useFormikContext<RecursivePartial<AuthorData>>();

        const [milestone, setMilestone] = useState(item.type === 'Milestone');

        const inputId = `timeline-event-${index}`,
          eventTypeId = `timeline-event-${index}-event-type`;

        const fieldName = `timeline.${index}`;

        let dateKeys: Parameters<typeof TimelineEventComponent>[0]['dateKeys'];

        if (milestone) {
          dateKeys = [
            {
              keyName: 'date',
              label: 'Date',
            },
          ];
        } else {
          dateKeys = [
            { keyName: 'startDate', label: 'Start Date' },
            { keyName: 'endDate', label: 'End Date' },
          ];
        }

        return (
          <TimelineEventComponent
            id={inputId}
            required={true}
            dateKeys={dateKeys}
            headerText="Event"
            children={{
              header: (
                <>
                  <input
                    className="editAuthorMilestoneToggle"
                    id={eventTypeId}
                    type="checkbox"
                    onChange={async (event) => {
                      dateKeys.forEach(async (key) => {
                        await setFieldValue(`${fieldName}.${key}`, undefined);
                        delete (values.timeline![index] as any)[key.keyName];
                      });

                      const isMilestone = event.currentTarget.checked;

                      setMilestone(isMilestone);
                      setFieldValue(
                        `${fieldName}.type`,
                        isMilestone ? 'Milestone' : 'Timeline',
                      );
                    }}
                    checked={milestone}
                  />
                  <label htmlFor={eventTypeId}>Milestone?</label>
                  <RemoveButton item={item} index={index} />
                </>
              ),
            }}
            fieldName={fieldName}
            item={item as BaseTimelineEvent}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
          />
        );
      };
    }, []);

  const BirthField: ({
    item,
  }: {
    item: RecursivePartial<BirthEvent>;
  }) => JSX.Element = useMemo(() => {
    return ({ item }) => {
      const { handleChange, setFieldValue } = useFormikContext<Author>();

      return (
        <TimelineEventComponent
          id={birthDateId}
          required={true}
          dateKeys={[{ keyName: 'date', label: 'Date' }]}
          headerText="Birth"
          fieldName="birthDate"
          hide={{
            achievement: true,
          }}
          item={item as BaseTimelineEvent}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
      );
    };
  }, []);

  const DeathField: ({
    item,
  }: {
    item: RecursivePartial<DeathEvent>;
  }) => JSX.Element = useMemo(() => {
    return ({ item }) => {
      const { handleChange, setFieldValue } = useFormikContext<Author>();

      return (
        <TimelineEventComponent
          id={deathDateId}
          required={true}
          dateKeys={[{ keyName: 'date', label: 'Date' }]}
          headerText="Death"
          fieldName="deathDate"
          hide={{
            achievement: true,
          }}
          item={item as BaseTimelineEvent}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
      );
    };
  }, []);

  return (
    <CommonModal opened={opened} appElement={appElement} onClose={onClose}>
      <Formik<RecursivePartial<AuthorData>>
        initialValues={initialData}
        onSubmit={async (finalData) => {
          setLoading(true);

          let deathDate: DeathEvent | undefined;

          if (finalData.deathDate) {
            deathDate = {
              ...(finalData.deathDate as DeathEvent),
              type: 'Death',
            };
          }

          try {
            await onSubmit?.({
              ...finalData,
              author: finalData.author,
              birthDate: {
                ...finalData.birthDate,
                type: 'Birth',
              },
              deathDate,
            } as AuthorData);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ handleSubmit, values, handleChange, setFieldValue, isValid }) => {
          const timeline = values.timeline ?? [];

          return (
            <form className="editAuthorForm" onSubmit={handleSubmit}>
              <div className="editAuthorPortraitRow">
                <div className="editAuthorPortraitContainer">
                  {values.author?.portrait?.src && (
                    <img src={values.author?.portrait?.src} loading="lazy" />
                  )}
                </div>
                <div className="editAuthorPortraitDetails">
                  <label htmlFor={portraitId}>Portrait</label>
                  <input
                    id={portraitId}
                    type="text"
                    name="portrait.src"
                    value={values.author?.portrait?.src}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label htmlFor={authorFirstNameId}>Author first name *</label>
              <input
                id={authorFirstNameId}
                type="text"
                name="author.authorFirstName"
                value={values.author?.authorFirstName}
                required
                onChange={handleChange}
              />

              <label htmlFor={authorLastNameId}>Author last name *</label>
              <input
                id={authorLastNameId}
                type="text"
                name="author.authorLastName"
                value={values.author?.authorLastName}
                required
                onChange={handleChange}
              />

              <label htmlFor={authorFullNameId}>Author full name</label>
              <input
                id={authorFullNameId}
                type="text"
                name="author.authorFullName"
                value={values.author?.authorFullName}
                onChange={handleChange}
              />

              <label htmlFor={authorDisplayedNameId}>
                Displayed author name
              </label>
              <input
                id={authorDisplayedNameId}
                type="text"
                name="author.authorDisplayName"
                value={values.author?.authorDisplayName}
                onChange={handleChange}
              />

              <label htmlFor={referenceUrlId}>Reference URL</label>
              <input
                id={referenceUrlId}
                type="url"
                name="author.link"
                value={values.author?.link}
                onChange={handleChange}
              />

              <BirthField item={values.birthDate!} />

              <div className="editAuthorDeceasedRow">
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

              <label className="editAuthorTimelineLabel">Timeline</label>
              <DynamicList<RecursivePartial<AuthorTimelineEvent>>
                classes={{
                  component: 'editAuthorTimelineEventsContainer',
                  listItems: 'editAuthorTimelineEvents',
                }}
                items={
                  (values.timeline as Array<
                    RecursivePartial<AuthorTimelineEvent>
                  >) ?? []
                }
                ItemTemplate={TimelineEventField}
                trackItem={({ index }) => {
                  return index.toString();
                }}
                addText="Add event"
                onAdd={() => {
                  setFieldValue(
                    'timeline',
                    timeline.concat({ location: {} } as AuthorTimelineEvent),
                  );
                }}
                onRemove={({ index }) => {
                  setFieldValue('timeline', [
                    ...values.timeline!.slice(0, index),
                    ...values.timeline!.slice(index + 1),
                  ]);
                }}
              />

              <h4>Groups</h4>

              <AuthorGroupInput
                className="editAuthorGroupsContainer"
                values={
                  (values.author?.groups as Array<AuthorGroup['id']>) ?? []
                }
                registerAuthorGroup={async (group) => {
                  setLoading(true);

                  try {
                    onGroupCreated?.(group);
                  } finally {
                    setLoading(false);
                  }
                }}
                onChange={(groups) => {
                  setFieldValue('author.groups', groups);
                }}
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
