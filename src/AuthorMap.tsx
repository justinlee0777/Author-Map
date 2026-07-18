import { useMemo, useState, JSX, useCallback } from 'react';
import clsx from 'clsx';

import {
  AmericanLiteraryAward,
  type AuthorMapFilters,
  ClassicPublisher,
  type Author,
  type AuthorData,
  type AuthorGroup,
  type AuthorTimelineEvent,
  type BirthEvent,
  type DeathEvent,
  type MilestoneEvent,
  type AuthorMapProps,
  RecursivePartial,
} from './models';
import { AuthorMapStores } from './utils/stores';
import { Tabs } from './components/Tabs/Tabs';
import { AuthorMapView } from './components/AuthorMapView/AuthorMapView';
import { AuthorListView } from './components/AuthorListView/AuthorListView';
import { AuthorTimelineView } from './components/AuthorTimelineView/AuthorTimelineView';
import { AuthorMapDataContext } from './contexts';
import { ViewAuthorModal } from './components/ViewAuthorModal/ViewAuthorModal';
import { AuthorFilterView } from './components/AuthorFilterView';
import { AuthorFilterDrawer } from './components/AuthorFilterDrawer';
import { defaultFormula } from './consts/formula.const';

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
  stateCensus,
  entriesIntoUnion,
  className,
}: AuthorMapProps): JSX.Element {
  const [viewType, setViewType] = useState<ViewType>(ViewType.MAP);

  const [modalState, setModalState] = useState<ModalState | null>(null);

  // TODO: If it's a lot of data, do async? Return a promise?
  const statesData = useMemo(() => {
    return new AuthorMapStores(authors, timeline);
  }, [authors, timeline]);

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

  const [filters, setFilters] = useState<AuthorMapFilters>({
    eventTypes: ['Birth'],
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
      authorGroup: true,
    },
    formula: {
      equation: defaultFormula,
      threshold: 0,
    },
    yearRange: statesData.dateRange,
  });

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
      value={{
        data: statesData,
        filters,
        groups,
        stateCensus,
        entriesIntoUnion,
      }}
    >
      <div className={clsx('authorMapComponentContainer', className)}>
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

        <ViewAuthorModal
          opened={modalState?.type === 'viewingAuthor'}
          author={(modalState as ViewingAuthorModal)?.viewingAuthor}
          onClose={() => setModalState(null)}
        />

        <AuthorFilterDrawer
          className={clsx('floatingAction', 'authorMapFilterSideDrawer')}
          opened={modalState?.type === 'filterEditing'}
          onFiltersChange={setFilters}
          onClose={() => setModalState(null)}
        />
      </div>
    </AuthorMapDataContext.Provider>
  );
}
