import { JSX, useContext, useMemo } from 'react';

import { SideDrawer } from '../SideDrawer';
import { InclusionReasonSelect } from '../InclusionReasonSelect/InclusionReasonSelect';
import { AuthorMapDataContext } from '../../contexts';
import { Tabs } from '../Tabs/Tabs';
import { AuthorEventType, AuthorMapFilters } from '../../models';
import { SelectAuthorGroup } from '../SelectAuthorGroup/SelectAuthorGroup';

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
  const { filters } = useContext(AuthorMapDataContext);

  const [groupsFilterId, searchId] = useMemo(
    () => ['groups-filter', 'list-search-input'],
    [],
  );

  const { inclusionReasons, groupId, eventType, search } = filters;

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
    </SideDrawer>
  );
}
