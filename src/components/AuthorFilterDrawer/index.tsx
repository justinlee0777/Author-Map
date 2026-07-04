import { JSX, useContext, useMemo } from 'react';

import { SideDrawer } from '../SideDrawer';
import { InclusionReasonSelect } from '../InclusionReasonSelect/InclusionReasonSelect';
import { AuthorMapDataContext } from '../../contexts';
import { AuthorMapFilters, AuthorTimelineEvent } from '../../models';
import { SelectAuthorGroup } from '../SelectAuthorGroup/SelectAuthorGroup';
import { YearRange } from '../YearRange/YearRange';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { CollapsibleSection } from '../CollapsibleSection';
import { Formula } from '../Formula';

interface Props {
  onFiltersChange: (filters: AuthorMapFilters) => void;

  className?: string;
  onClose?: () => void;
}

export function AuthorFilterDrawer({
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
    <SideDrawer className={className} title="Filters" onClose={onClose}>
      <CollapsibleSection
        initialOpened
        header={<label htmlFor={eventTypeId}>Events</label>}
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        initialOpened={false}
        header={
          <label htmlFor={inclusionFilterId}>Reasons for inclusion</label>
        }
      >
        <InclusionReasonSelect
          id={inclusionFilterId}
          selected={inclusionReasons}
          onSelectedChange={(inclusionReasons) => {
            onFiltersChange({ ...filters, inclusionReasons });
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection initialOpened={false} header={<label>Formula</label>}>
        <Formula
          value={filters.formula}
          onChange={(formula) => onFiltersChange({ ...filters, formula })}
        />
      </CollapsibleSection>

      <CollapsibleSection
        initialOpened={false}
        header={<label htmlFor={searchId}>Search</label>}
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        initialOpened={false}
        header={<label htmlFor={groupId}>Groups</label>}
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        initialOpened={false}
        header={<label htmlFor={yearRangeId}>Year range</label>}
      >
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
      </CollapsibleSection>
    </SideDrawer>
  );
}
