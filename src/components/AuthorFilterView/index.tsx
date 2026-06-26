import { JSX, useMemo } from 'react';
import clsx from 'clsx';
import { Tooltip } from 'react-tooltip';
import { MdFilterList } from 'react-icons/md';

import { AuthorMapFilters } from '../../models';
import { AuthorFilterTag } from './AuthorFilterTag';

interface Props {
  filters: AuthorMapFilters;

  className?: string;
  onClick?: () => void;
}

export function AuthorFilterView({
  filters,
  className,
  onClick,
}: Props): JSX.Element {
  const tooltipId = useMemo(() => 'author-filter-view-tooltip', []);

  return (
    <div className={clsx('authorFilterView', className)}>
      <button className="button" onClick={onClick}>
        <MdFilterList />
      </button>

      <AuthorFilterTag
        type="yearRange"
        yearRange={filters.yearRange}
        tooltipId={tooltipId}
        onClick={onClick}
      />

      <AuthorFilterTag
        type="inclusionReason"
        values={filters.inclusionReasons}
        tooltipId={tooltipId}
        onClick={onClick}
      />

      {filters.eventType && (
        <AuthorFilterTag
          type="event"
          eventType={filters.eventType}
          tooltipId={tooltipId}
          onClick={onClick}
        />
      )}

      {filters.search && (
        <AuthorFilterTag
          type="search"
          search={filters.search}
          tooltipId={tooltipId}
          onClick={onClick}
        />
      )}

      {filters.groupId && (
        <AuthorFilterTag
          type="authorGroup"
          groupId={filters.groupId}
          tooltipId={tooltipId}
          onClick={onClick}
        />
      )}

      <Tooltip className="authorFilterViewTooltip" id={tooltipId} noArrow />
    </div>
  );
}
