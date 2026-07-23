import { JSX, useContext, useMemo, useState } from 'react';

import { SideDrawer } from '../SideDrawer';
import { InclusionReasonSelect } from '../InclusionReasonSelect/InclusionReasonSelect';
import { AuthorMapDataContext } from '../../contexts';
import { AuthorMapFilters, AuthorTimelineEvent } from '../../models';
import { SelectAuthorGroup } from '../SelectAuthorGroup/SelectAuthorGroup';
import { YearRange } from '../YearRange/YearRange';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { Formula } from '../Formula';
import { HelpButton } from '../HelpButton';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  opened: boolean;
  onFiltersChange: (filters: AuthorMapFilters) => void;

  className?: string;
  onClose?: () => void;
}

export function AuthorFilterDrawer({
  opened,
  onFiltersChange,
  className,
  onClose,
}: Props): JSX.Element {
  const { data, filters } = useContext(AuthorMapDataContext);

  const [
    eventTypeId,
    inclusionFilterId,
    groupsFilterId,
    searchId,
    yearRangeId,
  ] = useMemo(
    () => [
      'author-event-type',
      'author-inclusion-reasons',
      'author-filters-group',
      'author-filters-search',
      'author-filters-year-range',
    ],
    [],
  );

  const eventOptions: Array<{
    label: string;
    value: AuthorTimelineEvent['type'];
  }> = useMemo(
    () => [
      ...(['Birth', 'Death'] as const).map((value) => ({
        label: value,
        value,
      })),
      {
        label: 'Resided',
        value: 'Timeline',
      },
    ],
    [],
  );

  const [eventsExplanationOpened, setEventsExplanationOpened] = useState(false);

  const { inclusionReasons, groupId, eventTypes, search, yearRange } = filters;

  return (
    <SideDrawer
      className={className}
      title="Filters"
      opened={opened}
      onClose={onClose}
    >
      <details>
        <summary>Events</summary>
        <HelpButton
          className="eventsHelp"
          onClick={() => setEventsExplanationOpened(true)}
        />
        <Radiogroup<AuthorTimelineEvent['type']>
          id={eventTypeId}
          className="authorFilterDrawerEventType"
          options={eventOptions}
          selected={filters.eventTypes}
          type="checkbox"
          onChange={(value) => {
            if (eventTypes.includes(value)) {
              onFiltersChange({
                ...filters,
                eventTypes: eventTypes.filter((type) => type !== value),
              });
            } else {
              onFiltersChange({
                ...filters,
                eventTypes: eventTypes.concat(value),
              });
            }
          }}
        />
      </details>

      <details>
        <summary>Reasons for inclusion</summary>
        <InclusionReasonSelect
          id={inclusionFilterId}
          selected={inclusionReasons}
          onSelectedChange={(inclusionReasons) => {
            onFiltersChange({ ...filters, inclusionReasons });
          }}
        />
      </details>

      <details>
        <summary>Formula</summary>
        <Formula
          value={filters.formula}
          onChange={(formula) => onFiltersChange({ ...filters, formula })}
        />
      </details>

      <details>
        <summary>Search</summary>
        <input
          id={searchId}
          value={search ?? ''}
          type="text"
          onChange={(event) => {
            if (event.target.value) {
              onFiltersChange({
                ...filters,
                search: event.target.value.replaceAll(/[^a-zA-Z\d\s:]/g, ''),
              });
            } else {
              onFiltersChange({ ...filters, search: undefined });
            }
          }}
        />
      </details>

      <details>
        <summary>Groups</summary>
        <SelectAuthorGroup
          id={groupsFilterId}
          value={groupId}
          onSelect={(value) => {
            onFiltersChange({
              ...filters,
              groupId: value?.id ?? undefined,
            });
          }}
        />
      </details>

      <details>
        <summary>Year range</summary>
        <YearRange
          id={yearRangeId}
          startingYear={data.dateRange[0]}
          endingYear={data.dateRange[1]}
          value={yearRange}
          onYearRangeChange={(startingYear, endingYear) => {
            onFiltersChange({
              ...filters,
              yearRange: [startingYear, endingYear],
            });
          }}
        />
      </details>

      <CommonModal
        className="eventsHelpModal"
        opened={eventsExplanationOpened}
        onClose={() => setEventsExplanationOpened(false)}
      >
        <p>
          This corpus was taken by an automated pipeline. This means it's
          unlikely to be accurate, but it ensures the longevity of the project
          by way of saving me a lot of time.
        </p>
        <p>
          I took the Wikipedia entries for various authors and fed them to GPT
          (the only use of an LLM for this entire project) to output the place
          of residency for them.
        </p>
        <p>
          Predictably, the timelines it output were not great, but this is not
          GPT's fault, as I expected the output to not be great. None of the
          entries - except for the most well-researched of authors - would have
          complete timelines. Rather than have no data, I preferred to have data
          that could be edited.
        </p>
        <p>
          You will notice much of the data for residence to be imperfect and
          nonsensical, as I have not edited it yet. Apologies.
        </p>
      </CommonModal>
    </SideDrawer>
  );
}
