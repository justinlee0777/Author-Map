import { JSX, ReactNode, useContext } from 'react';
import {
  AuthorEventType,
  AuthorGroup,
  InclusionReasonValues,
} from '../../models';
import { convertValuesToFilters } from '../InclusionReasonSelect/InclusionReasonSelect';
import clsx from 'clsx';
import { AuthorMapDataContext } from '../../contexts';

interface EventTypeProps {
  eventType: AuthorEventType;
  type: 'event';
}

interface InclusionReasonProps {
  values: InclusionReasonValues;
  type: 'inclusionReason';
}

interface SearchProps {
  search: string;
  type: 'search';
}

interface AuthorGroupProps {
  groupId: AuthorGroup['id'];
  type: 'authorGroup';
}

type TagProps =
  | EventTypeProps
  | InclusionReasonProps
  | SearchProps
  | AuthorGroupProps;

type Props = TagProps & {
  tooltipId: string;

  onClick?: () => void;
};

export function AuthorFilterTag(props: Props): JSX.Element {
  const { groups } = useContext(AuthorMapDataContext);

  const { type, tooltipId, onClick } = props;

  let tagContents: ReactNode;

  switch (type) {
    case 'event':
      const { eventType } = props;
      tagContents = `Event: ${eventType}`;
      break;
    case 'inclusionReason':
      const { values } = props;

      const filters = convertValuesToFilters(values);

      const flattenedFilters = filters
        .map((filter) => {
          if (typeof filter === 'string') {
            return filter;
          } else if (filter.type === 'award') {
            return filter.award;
          } else {
            return filter.publishers;
          }
        })
        .flat();

      const cutoff = 2;

      let filtersShown = flattenedFilters.slice(0, cutoff).join(', ');

      const remainingFilters = flattenedFilters.slice(cutoff).length;

      filtersShown = `${filtersShown}${remainingFilters > 0 ? `, +${remainingFilters}` : ''}`;

      tagContents = (
        <span data-tooltip-id={tooltipId} data-tooltip-content={filtersShown}>
          Reasons (+{flattenedFilters.length})
        </span>
      );
      break;
    case 'search':
      const { search } = props;

      tagContents = `Search: "${search}"`;
      break;
    case 'authorGroup':
      const { groupId } = props;

      const authorGroup = groups.find((group) => group.id === groupId)!;

      tagContents = `Group: "${authorGroup.name}"`;
      break;
  }

  return (
    <button className={clsx('button', 'authorFilterTag')} onClick={onClick}>
      {tagContents}
    </button>
  );
}
