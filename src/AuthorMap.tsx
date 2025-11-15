import styles from './AuthorMap.module.css';
import commonStyles from './common.module.css';

import { useMemo, useRef, useState, JSX } from 'react';
import clsx from 'clsx';

import { Author, AuthorGroup } from './models';
import { EditAuthorModal } from './components/EditAuthorModal/EditAuthorModal';
import { AuthorStores } from './utils/stores';
import { Tabs } from './components/Tabs/Tabs';
import { AuthorMapView } from './components/AuthorMapView/AuthorMapView';
import { AuthorListView } from './components/AuthorListView/AuthorListView';
import { getAuthorName } from './utils/names';
import { AuthorTimelineView } from './components/AuthorTimelineView/AuthorTimelineView';
import { AddAuthor } from './components/AddAuthor/AddAuthor';
import { AddAuthorGroup } from './components/AddAuthorGroup/AddAuthorGroup';
import { AuthorGroupContext } from './contexts';
import { EditAuthorGroupModal } from './components/EditAuthorGroupModal/EditAuthorGroupModal';

interface Props {
  authors: Array<Author>;

  groups?: Array<AuthorGroup>;

  className?: string;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   * TODO: How should IDs be handled?
   */
  syncAuthorAdded?: (author: Author) => void | Promise<void>;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   */
  syncAuthorUpdate?: (changedAuthor: Author) => void | Promise<void>;

  onGroupCreated?: (authorGroup: AuthorGroup) => void | Promise<void>;

  onGroupUpdated?: (authorGroup: AuthorGroup) => void | Promise<void>;
}

enum ViewType {
  MAP = 'Map',
  LIST = 'List',
  TIMELINE = 'Timeline',
}

/**
 * This is not pure. This will internally update authors.
 * This is up for debate. The component cannot know what changes are made to the 'authors' prop. Therefore, for any change,
 * every author needs to be scanned and the stores need to be updated. This can be costly for performance.
 * TODO: There is a strategy to block data change if the external datastore fails, but there also needs to be a fallback strategy
 * if the client prefers to update now and correct later.
 *
 *
 * TODO: Groups view? ex. Nobel Prize winners? Genre? Harlem Renaissance? Genre (class literature)? Etc?
 * TODO: Search?
 * TODO: Discussion system?
 * TODO: Full timeline
 * TODO: Show who is in a state on hover? Need to see some data early
 * TODO: Sort on startup? Async? Will it be a lot of data? Hmm.
 * TODO: Might want to break this up into different components.
 * TODO: Editing + export JSON
 * TODO: Overall timeline
 * TODO: Import? JSON validate?
 * TODO: Links to bibliography
 * TODO: Nicer version of timeline
 * TODO: Need to reorder timeline
 * TODO: Accept a stream?
 */
export function AuthorMap({
  authors,
  groups = [],
  className,
  syncAuthorAdded,
  syncAuthorUpdate,
  onGroupCreated,
  onGroupUpdated,
}: Props): JSX.Element {
  const componentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  const [viewType, setViewType] = useState<ViewType>(ViewType.MAP);

  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(
    null,
  );

  const [editingGroup, setEditingGroup] = useState<Partial<AuthorGroup> | null>(
    null,
  );

  // TODO: If it's a lot of data, do async? Return a promise?
  const statesData = useMemo(() => {
    return new AuthorStores(authors);
  }, [authors]);

  let viewElement: JSX.Element;

  switch (viewType) {
    case ViewType.MAP:
      viewElement = (
        <AuthorMapView
          statesData={statesData}
          onAuthorEdit={setEditingAuthor}
        />
      );
      break;
    case ViewType.LIST:
      viewElement = (
        <AuthorListView
          statesData={statesData}
          onAuthorEdit={setEditingAuthor}
        />
      );
      break;
    case ViewType.TIMELINE:
    default:
      viewElement = (
        <AuthorTimelineView
          statesData={statesData}
          onAuthorEdit={setEditingAuthor}
        />
      );
      break;
  }

  return (
    <AuthorGroupContext.Provider value={{ groups }}>
      <div
        className={clsx(styles.authorMapComponentContainer, className)}
        ref={componentRef}
      >
        <div className={styles.authorMapContainer}>{viewElement}</div>
        <Tabs<ViewType>
          className={clsx(
            commonStyles.floatingAction,
            styles.authorMapViewSwitch,
          )}
          highlightedValue={viewType}
          values={Object.values(ViewType).map((value) => ({
            value,
            label: value,
          }))}
          onChange={(value) => {
            if (value) {
              setViewType(value);
            }
          }}
        />

        <div
          className={clsx(
            commonStyles.floatingAction,
            styles.authorMapAddButtons,
          )}
        >
          <AddAuthor
            children={{ right: 'Add author' }}
            onClick={() => {
              setEditingAuthor({
                authorFirstName: '',
                authorLastName: '',
                authorFullName: '',
                timeline: [],
                portrait: {
                  src: '',
                },
                birthDate: {
                  date: '',
                  location: {
                    address: '',
                  },
                },
              });
            }}
          />

          <AddAuthorGroup
            children={{ right: 'Add group' }}
            onClick={() => {
              setEditingGroup({
                name: '',
                description: '',
                span: {
                  startDate: '',
                  endDate: '',
                },
              });
            }}
          />
        </div>

        {editingAuthor && (
          <EditAuthorModal
            appElement={componentRef.current!}
            opened={Boolean(editingAuthor)}
            initialAuthor={editingAuthor}
            onClose={() => setEditingAuthor(null)}
            onGroupCreated={onGroupCreated}
            onSubmit={async (author) => {
              setLoading(true);

              const updating = Boolean(author.id);

              try {
                if (updating) {
                  await syncAuthorUpdate?.(author);
                  statesData.update(author);
                } else {
                  await syncAuthorAdded?.(author);

                  if (!author.id) {
                    author.id = Symbol(`ID for ${getAuthorName(author)}`);
                  }

                  statesData.add(author);
                }

                setEditingAuthor(null);
              } catch (error) {
                console.error(
                  `Author could not be ${updating ? 'updated' : 'added'}.`,
                  error,
                );
                alert(
                  `Author could not be ${updating ? 'updated' : 'added'}. Please try again.`,
                );
              } finally {
                setLoading(false);
              }
            }}
          />
        )}

        {editingGroup && (
          <EditAuthorGroupModal
            appElement={componentRef.current!}
            opened={Boolean(editingGroup)}
            initialAuthorGroup={editingGroup}
            onClose={() => setEditingGroup(null)}
            onSubmit={async (group) => {
              setLoading(true);

              const updating = Boolean(group.id);

              try {
                if (updating) {
                  await onGroupUpdated?.(group);
                } else {
                  await onGroupCreated?.(group);

                  if (!group.id) {
                    group.id = Symbol(`ID for ${group.name}`);
                  }
                }

                setEditingGroup(null);
              } catch (error) {
                console.error(
                  `Group could not be ${updating ? 'updated' : 'added'}.`,
                  error,
                );
                alert(
                  `Group could not be ${updating ? 'updated' : 'added'}. Please try again.`,
                );
              } finally {
                setLoading(false);
              }
            }}
          />
        )}
      </div>
    </AuthorGroupContext.Provider>
  );
}
