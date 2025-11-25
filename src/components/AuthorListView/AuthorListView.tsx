import commonStyles from '../../common.module.css';
import styles from './AuthorListView.module.css';

import {
  Fragment,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthorFilter,
  AuthorSort,
  AuthorStores,
  createKeyGenerator,
} from '../../utils/stores';
import { AuthorRow } from '../AuthorRow/AuthorRow';
import { Tabs } from '../Tabs/Tabs';
import clsx from 'clsx';
import {
  Author,
  AuthorEventType,
  AuthorGroup,
  StateStore,
  USState,
} from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { SelectAuthorGroup } from '../SelectAuthorGroup/SelectAuthorGroup';
import { AuthorGroupContext } from '../../contexts';
import { getAuthorName } from '../../utils/names';

interface Props {
  statesData: AuthorStores;

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
  eventType,
  onEdit,
  onView,
}: {
  author: Author;
  eventType?: AuthorEventType;
  onEdit: () => void;
  onView: () => void;
}): JSX.Element {
  return (
    <AuthorRow author={author} eventType={eventType} showContext>
      <button
        className={clsx(commonStyles.button, styles.authorListViewEdit)}
        onClick={onView}
      >
        View
      </button>

      <button
        className={clsx(commonStyles.button, styles.authorListViewEdit)}
        onClick={onEdit}
      >
        Edit
      </button>
    </AuthorRow>
  );
}

export function AuthorListView({
  statesData,
  onAuthorEdit,
  onAuthorGroupEdit,
  onAuthorView,
}: Props): JSX.Element {
  const { groups } = useContext(AuthorGroupContext);

  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  const [viewType, setViewType] = useState<AuthorListViewType>(
      AuthorListViewType.AUTHOR,
    ),
    [authorEventType, setAuthorEventType] = useState<AuthorEventType>(
      AuthorEventType.BIRTHS,
    ),
    [sortType, setSortType] = useState<SortType>(SortType.NAME),
    [filteringGroup, setFilteringGroup] = useState<AuthorGroup | null>(null),
    [search, setSearch] = useState<string | null>(null);

  const filterAuthors: (authors: Array<Author>) => Array<Author> = useCallback(
    (authors) => {
      if (filteringGroup) {
        authors = authors.filter((author) =>
          author.groups?.includes(filteringGroup.id),
        );
      }

      if (search) {
        const searchRegex = new RegExp(search, 'i');

        authors = authors.filter((author) => {
          return searchRegex.test(getAuthorName(author));
        });
      }

      return authors;
    },
    [filteringGroup, search],
  );

  const [groupsFilterId, searchId] = useMemo(
    () => ['groups-filter', 'list-search-input'],
    [],
  );

  useEffect(() => {
    if (filteringGroup) {
      const foundGroup = groups.find((group) => group.id === filteringGroup.id);

      if (foundGroup && foundGroup !== filteringGroup) {
        setFilteringGroup(foundGroup);
      }
    }
  }, [filteringGroup, groups]);

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
          onChange={setSortType}
        />,
      ];
      break;
    case AuthorListViewType.STATE:
      filterElements = [
        <Tabs<AuthorEventType>
          key="authorEventType"
          className={clsx(styles.authorListViewEventType)}
          highlightedValue={authorEventType}
          values={Object.values(AuthorEventType).map((value) => ({
            value,
            label: value,
          }))}
          onChange={(value) => {
            if (value) {
              setAuthorEventType(value);
            }
          }}
        />,
      ];
      break;
  }

  let statesDataKey: keyof StateStore;

  switch (authorEventType) {
    case AuthorEventType.BIRTHS:
      statesDataKey = 'bornAuthors';
      break;
    case AuthorEventType.DEATHS:
      statesDataKey = 'deceasedAuthors';
      break;
    default:
      statesDataKey = 'residingAuthors';
      break;
  }

  let listElements: Array<JSX.Element>;

  switch (viewType) {
    case AuthorListViewType.AUTHOR: {
      const sortArg: AuthorSort = {},
        filterArg: AuthorFilter = {};

      switch (sortType) {
        case SortType.NAME:
          sortArg.name = true;
          break;
        case SortType.BIRTH:
          sortArg.birth = true;
          break;
        case SortType.DEATH:
          sortArg.death = true;
          filterArg.deceasedOnly = true;
          break;
      }

      let authors = statesData.getAll(sortArg, filterArg);

      authors = filterAuthors(authors);

      listElements = authors.map((author) => {
        return (
          <AuthorListRow
            key={authorKeyGenerator.getKey(author.id)}
            author={author}
            onView={() => onAuthorView?.(author)}
            onEdit={() => onAuthorEdit?.(author)}
          />
        );
      });
      break;
    }
    case AuthorListViewType.STATE: {
      listElements = Object.values(USState).map((usState) => {
        let authors = statesData.get(usState)[statesDataKey];

        authors = filterAuthors(authors);

        if (authors.length === 0) {
          return <Fragment key={usState}></Fragment>;
        } else {
          return (
            <div className={styles.authorListViewStateSection} key={usState}>
              <h3>{usState}</h3>
              {authors.map((author) => {
                return (
                  <AuthorListRow
                    key={authorKeyGenerator.getKey(author.id)}
                    author={author}
                    eventType={authorEventType}
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

  return (
    <div className={styles.authorListView}>
      <div className={styles.authorListViewEntries}>{listElements}</div>
      <div className={styles.authorListViewSettings}>
        <h2>Appearance</h2>
        <Tabs<AuthorListViewType>
          className={clsx(styles.authorListViewType)}
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

        <label htmlFor={searchId}>Search</label>
        <input
          id={searchId}
          value={search ?? ''}
          type="text"
          onChange={(event) => {
            if (event.target.value) {
              setSearch(event.target.value.replaceAll(/[^a-zA-Z\d\s:]/g, ''));
            } else {
              setSearch(null);
            }
          }}
        />

        <SelectAuthorGroup
          id={groupsFilterId}
          label="Groups"
          onSelect={setFilteringGroup}
        />

        {filteringGroup && (
          <p className={styles.authorListViewGroupDescription}>
            {filteringGroup.description}
            {filteringGroup.link && (
              <span>
                {' '}
                <a
                  className={styles.authorListViewGroupLink}
                  href={filteringGroup.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  link
                </a>
              </span>
            )}

            <button
              className={clsx(
                commonStyles.button,
                styles.authorListViewEditGroup,
              )}
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
