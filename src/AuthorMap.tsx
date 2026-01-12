import styles from './AuthorMap.module.css';
import commonStyles from './common.module.css';

import { useMemo, useRef, useState, JSX } from 'react';
import clsx from 'clsx';

import { Author, AuthorGroup, MajorEvent, MilestoneEvent } from './models';
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
import { AddMajorEvent } from './components/AddMajorEvent/AddMajorEvent';
import { EditMajorEventModal } from './components/EditMajorEventModal/EditMajorEventModal';
import { ViewAuthorModal } from './components/ViewAuthorModal/ViewAuthorModal';

interface Props {
  authors: Array<Author>;

  /**
   * Whether the client should be disabled from adding and editing authors / groups etc.
   * If a string is provided, this is the error message shown to user explaining why they cannot take any actions.
   */
  disabled?: boolean | string;

  groups?: Array<AuthorGroup>;

  majorEvents?: Array<MilestoneEvent>;

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

  onMajorEventCreated?: (event: MajorEvent) => void | Promise<void>;

  onMajorEventUpdated?: (event: MajorEvent) => void | Promise<void>;
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
 * TODO: If author residence dates are recorded, then we can do month / year filters of "who was in this state at so and so time"
 *
 * TODO: Really need to figure out how to distinguish authors i.e. "What are they known for - genre, masterpieces, blah"
 * TODO: Links to bibliography (bibliography can be part of Timeline, and a special tag can be assigned to the event for filtering)
 *
 * TODO: Genre (History / Philosophy / Fiction / Poetry)
 * TODO: Discussion system?
 * TODO: Show who is in a state on hover? Need to see some data early
 * TODO: Sort on startup? Async? Will it be a lot of data? Hmm.
 * TODO: Accept a stream?
 */
export function AuthorMap({
  authors,
  groups = [],
  majorEvents = [],
  className,
  disabled,
  syncAuthorAdded,
  syncAuthorUpdate,
  onGroupCreated,
  onGroupUpdated,
  onMajorEventCreated,
  onMajorEventUpdated,
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

  const [viewingAuthor, setViewingAuthor] = useState<Author | null>(null);

  const [editingMajorEvent, setEditingMajorEvent] =
    useState<Partial<MilestoneEvent> | null>(null);

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
          onAuthorView={setViewingAuthor}
          onAuthorGroupEdit={setEditingGroup}
        />
      );
      break;
    case ViewType.TIMELINE:
    default:
      viewElement = (
        <AuthorTimelineView statesData={statesData} majorEvents={majorEvents} />
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

          {viewType === ViewType.TIMELINE && (
            <AddMajorEvent
              children={{ right: 'Add major event' }}
              onClick={() => {
                setEditingMajorEvent({
                  location: {},
                });
              }}
            />
          )}
        </div>

        {editingAuthor && (
          <EditAuthorModal
            appElement={componentRef.current!}
            opened={Boolean(editingAuthor)}
            initialAuthor={editingAuthor}
            disabled={loading || disabled}
            onClose={() => setEditingAuthor(null)}
            onGroupCreated={onGroupCreated}
            onSubmit={async (author) => {
              if (disabled) {
                return;
              }

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
            disabled={loading || disabled}
            onClose={() => setEditingGroup(null)}
            onSubmit={async (group) => {
              if (disabled) {
                return;
              }

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

        {editingMajorEvent && (
          <EditMajorEventModal
            appElement={componentRef.current!}
            opened={Boolean(editingMajorEvent)}
            initialEvent={editingMajorEvent}
            disabled={loading || disabled}
            onClose={() => setEditingMajorEvent(null)}
            onSubmit={async (event) => {
              if (disabled) {
                return;
              }

              setLoading(true);

              const updating = Boolean(event.id);

              try {
                if (updating) {
                  await onMajorEventUpdated?.(event);
                } else {
                  await onMajorEventCreated?.(event);

                  if (!event.id) {
                    event.id = Symbol(`ID for a major event: ${event.notes}`);
                  }
                }

                setEditingMajorEvent(null);
              } catch (error) {
                console.error(
                  `Major event could not be ${updating ? 'updated' : 'added'}.`,
                  error,
                );
                alert(
                  `Major event could not be ${updating ? 'updated' : 'added'}. Please try again.`,
                );
              } finally {
                setLoading(false);
              }
            }}
          />
        )}

        {viewingAuthor && (
          <ViewAuthorModal
            appElement={componentRef.current!}
            opened={Boolean(viewingAuthor)}
            author={viewingAuthor}
            onClose={() => setViewingAuthor(null)}
          />
        )}
      </div>
    </AuthorGroupContext.Provider>
  );
}
