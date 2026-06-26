import { JSX, useContext, useMemo } from 'react';

import { SideDrawer } from '../SideDrawer';
import { InclusionReasonSelect } from '../InclusionReasonSelect/InclusionReasonSelect';
import { AuthorMapDataContext } from '../../contexts';
import { Tabs } from '../Tabs/Tabs';
import { AuthorEventType, AuthorMapFilters } from '../../models';
import { SelectAuthorGroup } from '../SelectAuthorGroup/SelectAuthorGroup';
import { YearRange } from '../YearRange/YearRange';

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

  const [groupsFilterId, searchId, yearRangeId] = useMemo(
    () => [
      'author-filters-group',
      'author-filters-search',
      'author-filters-year-range',
    ],
    [],
  );

  const { inclusionReasons, groupId, eventType, search, yearRange } = filters;

  return (
    <SideDrawer className={className} title="Filters" onClose={onClose}>
      <Tabs<AuthorEventType>
        className="authorFilterDrawerEventType"
        highlightedValue={eventType}
        values={Object.values(AuthorEventType).map((value) => ({
          value,
          label: value,
        }))}
        onChange={(value) => {
          if (value) {
            onFiltersChange({
              ...filters,
              eventType: value,
            });
          } else {
            onFiltersChange({
              ...filters,
              eventType: undefined,
            });
          }
        }}
      />

      <InclusionReasonSelect
        selected={inclusionReasons}
        onSelectedChange={(inclusionReasons) => {
          onFiltersChange({ ...filters, inclusionReasons });
        }}
      />

      <label htmlFor={searchId}>Search</label>
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

      <SelectAuthorGroup
        id={groupsFilterId}
        value={groupId}
        label="Groups"
        onSelect={(value) => {
          onFiltersChange({
            ...filters,
            groupId: value?.id ?? undefined,
          });
        }}
      />

      <label htmlFor={yearRangeId}>Year range</label>
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
    </SideDrawer>
  );
}
