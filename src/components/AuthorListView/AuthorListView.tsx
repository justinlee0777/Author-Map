import commonStyles from '../../common.module.css';
import styles from './AuthorListView.module.css';

import { Fragment, JSX, useMemo, useState } from 'react';
import {
  AuthorFilter,
  AuthorSort,
  AuthorStores,
  createKeyGenerator,
} from '../../utils/stores';
import { AuthorRow } from '../AuthorRow/AuthorRow';
import { Tabs } from '../Tabs/Tabs';
import clsx from 'clsx';
import { Author, AuthorEventType, StateStore, USState } from '../../models';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { AddAuthor } from '../AddAuthor/AddAuthor';

interface Props {
  statesData: AuthorStores;

  onAuthorEdit?: (author: Partial<Author>) => void;
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
  onEdit,
}: {
  author: Author;
  onEdit: () => void;
}): JSX.Element {
  return (
    <AuthorRow author={author}>
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
}: Props): JSX.Element {
  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  const [viewType, setViewType] = useState<AuthorListViewType>(
    AuthorListViewType.AUTHOR,
  );

  const [authorEventType, setAuthorEventType] = useState<AuthorEventType>(
    AuthorEventType.BIRTHS,
  );

  const [sortType, setSortType] = useState<SortType>(SortType.NAME);

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
    case AuthorListViewType.AUTHOR:
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

      listElements = statesData.getAll(sortArg, filterArg).map((author) => {
        return (
          <AuthorListRow
            key={authorKeyGenerator.getKey(author.id)}
            author={author}
            onEdit={() => onAuthorEdit?.(author)}
          />
        );
      });
      break;
    case AuthorListViewType.STATE:
      listElements = Object.values(USState).map((usState) => {
        const authors = statesData.get(usState)[statesDataKey];

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
      </div>
    </div>
  );
}
