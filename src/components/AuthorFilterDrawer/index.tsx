import { JSX, useContext, useMemo } from 'react';

import { SideDrawer } from '../SideDrawer';
import { InclusionReasonSelect } from '../InclusionReasonSelect/InclusionReasonSelect';
import { AuthorMapDataContext } from '../../contexts';
import { AuthorMapFilters, AuthorTimelineEvent } from '../../models';
import { SelectAuthorGroup } from '../SelectAuthorGroup/SelectAuthorGroup';
import { YearRange } from '../YearRange/YearRange';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { Formula } from '../Formula';

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
        <Radiogroup<AuthorTimelineEvent['type']>
          id={eventTypeId}
          className="authorFilterDrawerEventType"
          options={(['Birth', 'Death'] as const).map((value) => ({
            label: value,
            value,
          }))}
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
    </SideDrawer>
  );
}
