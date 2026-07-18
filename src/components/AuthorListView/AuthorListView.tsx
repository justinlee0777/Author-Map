import {
  Fragment,
  JSX,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AuthorMapStores,
  AuthorSort,
  createKeyGenerator,
} from '../../utils/stores';
import { AuthorRow } from '../AuthorRow/AuthorRow';
import { Tabs } from '../Tabs/Tabs';
import clsx from 'clsx';
import {
  Author,
  AuthorGroup,
  AuthorTimelineEvent,
  USState,
} from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { AuthorMapDataContext } from '../../contexts';
import infiniteScroll from '../../utils/infinite-scroll';
import { convertValuesToFilters } from '../InclusionReasonSelect/InclusionReasonSelect';

interface Props {
  onAuthorEdit?: (author: Partial<Author>) => void;
  onAuthorView?: (author: Author) => void;
  onAuthorGroupEdit?: (authorGroup: AuthorGroup) => void;
}

enum AuthorListViewType {
  AUTHOR = 'Author',
  STATE = 'State',
}

enum SortType {
  NAME = 'Name',
  BIRTH = 'Birth',
  DEATH = 'Death',
}

function AuthorListRow({
  author,
  events,
  onEdit,
  onView,
}: {
  author: Author;
  events: Array<AuthorTimelineEvent>;
  onEdit: () => void;
  onView: () => void;
}): JSX.Element {
  return (
    <AuthorRow className="authorListViewRow" author={author} events={events}>
      <button className={clsx('button', 'authorListViewEdit')} onClick={onView}>
        View
      </button>
    </AuthorRow>
  );
}

export function AuthorListView({
  onAuthorEdit,
  onAuthorGroupEdit,
  onAuthorView,
}: Props): JSX.Element {
  const {
    data: statesData,
    filters: {
      eventTypes,
      search,
      groupId,
      yearRange,
      formula,
      inclusionReasons,
    },
    groups,
  } = useContext(AuthorMapDataContext);

  const entriesRef = useRef<HTMLDivElement>(null);

  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  const [viewType, setViewType] = useState<AuthorListViewType>(
      AuthorListViewType.AUTHOR,
    ),
    [sortType, setSortType] = useState<SortType>(SortType.NAME);

  const initialEntriesShown = 6;

  const [entriesShown, setEntriesShown] = useState(initialEntriesShown);

  useEffect(() => {
    if (entriesRef.current) {
      const destroyInfiniteScroll = infiniteScroll(entriesRef.current, () =>
        setEntriesShown(
          Math.min(entriesShown + initialEntriesShown, statesData.numAuthors),
        ),
      );

      return () => {
        destroyInfiniteScroll();
      };
    }
  }, [entriesRef.current, entriesShown]);

  let filterElements: Array<JSX.Element>;

  switch (viewType) {
    case AuthorListViewType.AUTHOR:
      filterElements = [
        <Radiogroup
          key="sorting"
          header="Sorting"
          id="author-list-sorting"
          type="radio"
          options={Object.values(SortType).map((value) => ({
            value,
            label: value,
          }))}
          selected={sortType}
          onChange={(value) => {
            setEntriesShown(initialEntriesShown);
            setSortType(value);
          }}
        />,
      ];
      break;
    case AuthorListViewType.STATE:
      filterElements = [];
      break;
  }

  let listElements: Array<JSX.Element>;

  const inclusionReasonFilter = convertValuesToFilters(inclusionReasons);

  const filterArg: Parameters<AuthorMapStores['getAll']>[0] = {
    yearRange,
    eventTypes,
    search,
    groupId,
    formula,
    inclusionReasons: inclusionReasonFilter,
  };

  switch (viewType) {
    case AuthorListViewType.AUTHOR: {
      const sortArg: AuthorSort = {};

      switch (sortType) {
        case SortType.NAME:
          sortArg.name = true;
          break;
        case SortType.BIRTH:
          sortArg.birth = true;
          break;
        case SortType.DEATH:
          sortArg.death = true;
          break;
      }

      const authors = statesData.getAll(filterArg, sortArg);

      listElements = authors.map((author) => {
        const birthDate = statesData.getBirthDate(author.id),
          deathDate = statesData.getDeathDate(author.id);

        return (
          <AuthorListRow
            key={authorKeyGenerator.getKey(author.id)}
            author={author}
            events={[birthDate, deathDate].filter(
              (event): event is NonNullable<typeof event> => Boolean(event),
            )}
            onView={() => onAuthorView?.(author)}
            onEdit={() => onAuthorEdit?.(author)}
          />
        );
      });
      break;
    }
    case AuthorListViewType.STATE: {
      listElements = Object.values(USState).map((usState) => {
        const authors = statesData.getAll({
          ...filterArg,
          state: usState,
        });

        if (authors.length === 0) {
          return <Fragment key={usState}></Fragment>;
        } else {
          return (
            <div className="authorListViewStateSection" key={usState}>
              <h3>{usState}</h3>
              {authors.map((author) => {
                let events: Array<AuthorTimelineEvent> = [];

                for (const eventType of eventTypes) {
                  switch (eventType) {
                    case 'Birth':
                      const birthDate = statesData.getBirthDate(author.id);

                      if (birthDate) {
                        events.push(birthDate);
                      }
                      break;
                    case 'Death':
                      const deathDate = statesData.getDeathDate(author.id);
                      if (deathDate) {
                        events.push(deathDate);
                      }
                      break;
                  }
                }

                return (
                  <AuthorListRow
                    key={authorKeyGenerator.getKey(author.id)}
                    author={author}
                    events={events}
                    onView={() => onAuthorView?.(author)}
                    onEdit={() => onAuthorEdit?.(author)}
                  />
                );
              })}
            </div>
          );
        }
      });
      break;
    }
  }

  const filteringGroup = groups.find((group) => group.id === groupId);

  return (
    <div className="authorListView">
      <div className="authorListViewEntries" ref={entriesRef}>
        {listElements.slice(0, entriesShown)}
      </div>
      <div className="authorListViewSettings">
        <h2>Appearance</h2>
        <Tabs<AuthorListViewType>
          className={clsx('authorListViewType')}
          highlightedValue={viewType}
          values={[
            {
              value: AuthorListViewType.AUTHOR,
              label: 'Author',
            },
            {
              value: AuthorListViewType.STATE,
              label: 'State',
            },
          ]}
          onChange={(value) => {
            if (value) {
              setViewType(value);
            }
          }}
        />

        {filterElements}

        {filteringGroup && (
          <p className="authorListViewGroupDescription">
            {filteringGroup.description}
            {filteringGroup.link && (
              <span>
                {' '}
                <a
                  className="authorListViewGroupLink"
                  href={filteringGroup.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  link
                </a>
              </span>
            )}

            <button
              className={clsx('button', 'authorListViewEditGroup')}
              onClick={() => onAuthorGroupEdit?.(filteringGroup)}
            >
              Edit
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
