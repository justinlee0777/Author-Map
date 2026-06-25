import { useMemo, useRef, useState, JSX, useCallback } from 'react';
import clsx from 'clsx';

import {
  AmericanLiteraryAward,
  AuthorEventType,
  AuthorMapFilters,
  ClassicPublisher,
  type Author,
  type AuthorData,
  type AuthorGroup,
  type AuthorTimelineEvent,
  type BirthEvent,
  type CityCoordinates,
  type DeathEvent,
  type MilestoneEvent,
} from './models';
import { EditAuthorModal } from './components/EditAuthorModal/EditAuthorModal';
import { AuthorMapStores } from './utils/stores';
import { Tabs } from './components/Tabs/Tabs';
import { AuthorMapView } from './components/AuthorMapView/AuthorMapView';
import { AuthorListView } from './components/AuthorListView/AuthorListView';
import { AuthorTimelineView } from './components/AuthorTimelineView/AuthorTimelineView';
import { AddAuthor } from './components/AddAuthor/AddAuthor';
import { AddAuthorGroup } from './components/AddAuthorGroup/AddAuthorGroup';
import { AuthorMapDataContext } from './contexts';
import { EditAuthorGroupModal } from './components/EditAuthorGroupModal/EditAuthorGroupModal';
import { AddMajorEvent } from './components/AddMajorEvent/AddMajorEvent';
import { EditMajorEventModal } from './components/EditMajorEventModal/EditMajorEventModal';
import { ViewAuthorModal } from './components/ViewAuthorModal/ViewAuthorModal';
import { AuthorFilterView } from './components/AuthorFilterView';
import { AuthorFilterDrawer } from './components/AuthorFilterDrawer';

interface Props {
  authors: Array<Author>;

  /**
   * Whether the client should be disabled from adding and editing authors / groups etc.
   * If a string is provided, this is the error message shown to user explaining why they cannot take any actions.
   */
  disabled?: boolean | string;

  groups?: Array<AuthorGroup>;

  timeline?: Array<AuthorTimelineEvent>;

  cityCoordinates?: Array<CityCoordinates>;

  className?: string;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   * TODO: How should IDs be handled?
   */
  syncAuthorAdded?: (author: AuthorData) => void | Promise<void>;
  /**
   * Used to update an external dataset.
   * The component keeps a local state; if this callback throws an error, then this local state will not be updated.
   */
  syncAuthorUpdate?: (changedAuthor: AuthorData) => void | Promise<void>;

  onGroupCreated?: (authorGroup: AuthorGroup) => void | Promise<void>;

  onGroupUpdated?: (authorGroup: AuthorGroup) => void | Promise<void>;

  onTimelineEventCreated?: (event: AuthorTimelineEvent) => void | Promise<void>;

  onTimelineEventUpdated?: (event: AuthorTimelineEvent) => void | Promise<void>;
}

enum ViewType {
  MAP = 'Map',
  LIST = 'List',
  TIMELINE = 'Timeline',
}

interface EditingAuthorModal {
  editingAuthor: RecursivePartial<AuthorData>;
  type: 'editingAuthor';
}

interface EditingGroupModal {
  editingGroup: Partial<AuthorGroup>;
  type: 'editingGroup';
}

interface ViewingAuthorModal {
  viewingAuthor: Author;
  type: 'viewingAuthor';
}

interface EditingMajorEventModal {
  editingMajorEvent: Partial<MilestoneEvent>;
  type: 'editingMajorEvent';
}

interface FilterEditingModal {
  type: 'filterEditing';
}

type ModalState =
  | EditingAuthorModal
  | EditingGroupModal
  | ViewingAuthorModal
  | EditingMajorEventModal
  | FilterEditingModal;

/**
 * This is not pure. This will internally update authors.
 * This is up for debate. The component cannot know what changes are made to the 'authors' prop. Therefore, for any change,
 * every author needs to be scanned and the stores need to be updated. This can be costly for performance.
 * TODO: There is a strategy to block data change if the external datastore fails, but there also needs to be a fallback strategy
 * if the client prefers to update now and correct later.
 *
 * TODO: If author residence dates are recorded, then we can do month / year filters of "who was in this state at so and so time"
 *
 * TODO: Support TimeSpan events.
 * TODO: It's fine if TimelineView by default includes Birth and Death, but should be able to select for specific Author timelines.
 *    Similarly, other Author Timeline events should be lazy loaded.
 * TODO: Filter timeline by births / deaths / milestones
 * TODO: It may be wise to specify a year for "Residing authors", rather than storing them all. Alternatively, providing a city to see which authors have lived here works too.
 *
 * TODO: Books model
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
  timeline = [],
  cityCoordinates = [],
  className,
  disabled,
  syncAuthorAdded,
  syncAuthorUpdate,
  onGroupCreated,
  onGroupUpdated,
  onTimelineEventCreated,
  onTimelineEventUpdated,
}: Props): JSX.Element {
  const componentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  const [viewType, setViewType] = useState<ViewType>(ViewType.MAP);

  const [modalState, setModalState] = useState<ModalState | null>(null);

  const [filters, setFilters] = useState<AuthorMapFilters>({
    eventType: AuthorEventType.BIRTHS,
    inclusionReasons: {
      poetLaureates: true,
      publishers: {
        checked: true,
        collapsed: true,
        specific: {
          [ClassicPublisher.DALKEY]: true,
          [ClassicPublisher.LIBRARY_OF_AMERICA]: true,
          [ClassicPublisher.NORTON]: true,
          [ClassicPublisher.NYRB]: true,
          [ClassicPublisher.PENGUIN_CLASSIC]: true,
        },
      },
      awards: {
        checked: true,
        collapsed: true,
        specific: {
          [AmericanLiteraryAward.NATIONAL_BOOK_FICTION]: true,
          [AmericanLiteraryAward.NATIONAL_BOOK_POETRY]: true,
          [AmericanLiteraryAward.NOBEL_PRIZE_IN_LITERATURE]: true,
          [AmericanLiteraryAward.PULITZER_FICTION]: true,
          [AmericanLiteraryAward.PULITZER_POETRY]: true,
        },
      },
      personal: false,
    },
  });

  // TODO: If it's a lot of data, do async? Return a promise?
  const statesData = useMemo(() => {
    return new AuthorMapStores(authors, timeline);
  }, [authors]);

  const onAuthorEdit = useCallback(
    (author: Partial<Author>) => {
      let birthDate: BirthEvent | undefined,
        deathDate: DeathEvent | undefined,
        timeline: Array<AuthorTimelineEvent> = [];

      if (author.id) {
        ((birthDate = statesData.getBirthDate(author.id)),
          (deathDate = statesData.getDeathDate(author.id)));
        timeline = statesData.getAuthorTimeline(author.id, true);
      }

      setModalState({
        type: 'editingAuthor',
        editingAuthor: {
          author,
          birthDate,
          deathDate,
          timeline,
        },
      });
    },
    [statesData, setModalState],
  );

  let viewElement: JSX.Element;

  switch (viewType) {
    case ViewType.MAP:
      viewElement = (
        <AuthorMapView
          cityCoordinates={cityCoordinates}
          onAuthorEdit={onAuthorEdit}
          onAuthorView={(viewingAuthor) =>
            setModalState({
              viewingAuthor,
              type: 'viewingAuthor',
            })
          }
        />
      );
      break;
    case ViewType.LIST:
      viewElement = (
        <AuthorListView
          onAuthorEdit={onAuthorEdit}
          onAuthorView={(viewingAuthor) =>
            setModalState({
              viewingAuthor,
              type: 'viewingAuthor',
            })
          }
          onAuthorGroupEdit={(editingGroup) =>
            setModalState({
              editingGroup,
              type: 'editingGroup',
            })
          }
        />
      );
      break;
    case ViewType.TIMELINE:
    default:
      viewElement = (
        <AuthorTimelineView
          onAuthorView={(viewingAuthor) =>
            setModalState({
              viewingAuthor,
              type: 'viewingAuthor',
            })
          }
        />
      );
      break;
  }

  return (
    <AuthorMapDataContext.Provider
      value={{ data: statesData, filters, groups }}
    >
      <div
        className={clsx('authorMapComponentContainer', className)}
        ref={componentRef}
      >
        <div className="authorMapActions">
          <Tabs<ViewType>
            className={clsx('authorMapViewSwitch')}
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
          <AuthorFilterView
            filters={filters}
            onClick={() => setModalState({ type: 'filterEditing' })}
          />
        </div>
        <div className="authorMapContainer">{viewElement}</div>
        <div className={clsx('floatingAction', 'authorMapAddButtons')}>
          <AddAuthor
            children={{ right: 'Add author' }}
            onClick={() => {
              setModalState({
                type: 'editingAuthor',
                editingAuthor: {
                  author: {
                    authorFirstName: '',
                    authorLastName: '',
                    authorFullName: '',
                    portrait: {
                      src: '',
                    },
                  },
                  birthDate: {
                    date: '',
                    type: 'Birth',
                  },
                  timeline: [],
                },
              });
            }}
          />

          <AddAuthorGroup
            children={{ right: 'Add group' }}
            onClick={() => {
              setModalState({
                editingGroup: {
                  name: '',
                  description: '',
                  span: {
                    startDate: '',
                    endDate: '',
                  },
                },
                type: 'editingGroup',
              });
            }}
          />

          {viewType === ViewType.TIMELINE && (
            <AddMajorEvent
              children={{ right: 'Add major event' }}
              onClick={() => {
                setModalState({
                  type: 'editingMajorEvent',
                  editingMajorEvent: {
                    location: {},
                  },
                });
              }}
            />
          )}
        </div>

        {modalState?.type === 'editingAuthor' && (
          <EditAuthorModal
            appElement={componentRef.current!}
            opened
            initialData={modalState.editingAuthor}
            disabled={loading || disabled}
            onClose={() => setModalState(null)}
            onGroupCreated={onGroupCreated}
            onSubmit={async (data) => {
              if (disabled) {
                return;
              }

              setLoading(true);

              const updating = Boolean(data.author.id);

              try {
                const fullTimeline: Array<AuthorTimelineEvent> = [
                  data.birthDate,
                  ...(data.timeline ?? []),
                ];

                if (data.deathDate) {
                  fullTimeline.push(data.deathDate);
                }

                if (updating) {
                  await syncAuthorUpdate?.(data);

                  statesData.update(data.author);
                } else {
                  await syncAuthorAdded?.(data);

                  statesData.add(data.author);
                }

                statesData.setAuthorTimeline(data.author.id, fullTimeline);
                statesData.setBirthDate(data.author.id, data.birthDate);

                if (data.deathDate) {
                  statesData.setDeathDate(data.author.id, data.deathDate);
                } else {
                  statesData.removeDeathDate(data.author.id);
                }

                setModalState(null);
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

        {modalState?.type === 'editingGroup' && (
          <EditAuthorGroupModal
            appElement={componentRef.current!}
            opened
            initialAuthorGroup={modalState.editingGroup}
            disabled={loading || disabled}
            onClose={() => setModalState(null)}
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
                    group.id = `ID for ${group.name}`;
                  }
                }

                setModalState(null);
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

        {modalState?.type === 'editingMajorEvent' && (
          <EditMajorEventModal
            appElement={componentRef.current!}
            opened
            initialEvent={modalState.editingMajorEvent}
            disabled={loading || disabled}
            onClose={() => setModalState(null)}
            onSubmit={async (event) => {
              if (disabled) {
                return;
              }

              setLoading(true);

              const updating = Boolean(event.id);

              try {
                if (updating) {
                  await onTimelineEventUpdated?.(event);
                } else {
                  await onTimelineEventCreated?.(event);

                  if (!event.id) {
                    event.id = Symbol(`ID for a major event: ${event.notes}`);
                  }
                }

                setModalState(null);
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

        {modalState?.type === 'viewingAuthor' && (
          <ViewAuthorModal
            appElement={componentRef.current!}
            opened
            author={modalState.viewingAuthor}
            onClose={() => setModalState(null)}
          />
        )}
        {modalState?.type === 'filterEditing' && (
          <AuthorFilterDrawer
            className={clsx('floatingAction', 'authorMapFilterSideDrawer')}
            onFiltersChange={setFilters}
            onClose={() => setModalState(null)}
          />
        )}
      </div>
    </AuthorMapDataContext.Provider>
  );
}
