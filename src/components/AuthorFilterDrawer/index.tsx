import { JSX, useContext, useMemo, useState } from 'react';
import clsx from 'clsx';

import { SideDrawer } from '../SideDrawer';
import { InclusionReasonSelect } from '../InclusionReasonSelect/InclusionReasonSelect';
import { AuthorMapDataContext } from '../../contexts';
import { AuthorMapFilters, AuthorTimelineEvent } from '../../models';
import { SelectAuthorGroup } from '../SelectAuthorGroup/SelectAuthorGroup';
import { YearRange } from '../YearRange/YearRange';
import { Radiogroup } from '../Radiogroup/Radiogroup';
import { Formula } from '../Formula';
import { HelpButton } from '../HelpButton';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  opened: boolean;
  onFiltersChange: (filters: AuthorMapFilters) => void;

  className?: string;
  onClose?: () => void;
}

type ExplanationType =
  | { type: 'eventType' }
  | { type: 'minResidence' }
  | { type: 'timeUntilImmigration' };

export function AuthorFilterDrawer({
  opened,
  onFiltersChange,
  className,
  onClose,
}: Props): JSX.Element {
  const { data, filters } = useContext(AuthorMapDataContext);

  const [
    eventTypeId,
    inclusionFilterId,
    groupsFilterId,
    searchId,
    yearRangeId,
    minimumResidenceId,
    timeUntilImmigrationId,
  ] = useMemo(
    () => [
      'author-event-type',
      'author-inclusion-reasons',
      'author-filters-group',
      'author-filters-search',
      'author-filters-year-range',
      'author-minimum-residence',
      'author-time-until-immigration',
    ],
    [],
  );

  const eventOptions: Array<{
    label: string;
    value: AuthorTimelineEvent['type'];
  }> = useMemo(
    () => [
      ...(['Birth', 'Death'] as const).map((value) => ({
        label: value,
        value,
      })),
      {
        label: 'Resided',
        value: 'Timeline',
      },
    ],
    [],
  );

  const [explanationOpened, setExplanationOpened] = useState<
    ExplanationType | undefined
  >();

  const residingAuthorsExplanation = useMemo(
    () => (
      <>
        <p>
          This corpus was taken by an automated pipeline. This means it's
          unlikely to be accurate, but it ensures the longevity of the project
          by way of saving me a lot of time.
        </p>
        <p>
          I took the Wikipedia entries for various authors and fed them to GPT
          (the only use of an LLM for this entire project) to output the place
          of residency for them.
        </p>
        <p>
          Predictably, the timelines it output were not great, but this is not
          GPT's fault, as I expected the output to not be great. None of the
          entries - except for the most well-researched of authors - would have
          complete timelines. Rather than have no data, I preferred to have data
          that could be edited.
        </p>
        <p>
          You will notice much of the data for residence to be imperfect and
          nonsensical, as I have not edited it yet. Apologies.
        </p>
      </>
    ),
    [],
  );

  const minResidenceExplanation = useMemo(
    () => (
      <>
        <p>
          The filter is useful for determing how long an author has been at a
          state / address, as sometimes the author will be someplace for just a
          year.
        </p>
        <p>"Months" seemed to be a granular enough unit of time.</p>
        <p>
          The filter only applies for continuous stays i.e. if X is in Colorado
          for 3 months, then in Florida, then in Colorado, the filter treats
          both stays in Colorado as separate. This seems logical and consistent
          with the use of this filter.
        </p>
        <p>
          This filter is only useful for views that include state / address in
          their view. Furthermore, this is entirely useless for birth and death
          dates.
        </p>
      </>
    ),
    [],
  );

  const timeUntilImmigrationExplanation = useMemo(
    () => (
      <>
        <p>This metric may be odd, even after explanation.</p>
        <p>
          Under Wikipedia's "List of American Nobel Laureates",{' '}
          <a href="https://en.wikipedia.org/wiki/Isaac_Bashevis_Singer">
            Isaac Bashevis Singer
          </a>
          , for example, and I am not singling him out in particular, is
          counted, and yet he spent most of his formative years - indeed, what
          most would call the crucible of his creative life - in Poland,
          arriving in the US at age 32.
        </p>
        <p>
          To be very clear, this is not accusing any of these authors as lacking
          merit; as this is an analysis of America's literary canon, it would of
          course be strange to include writers who could fairly be argued lack a
          particular American experience. Furthermore, most American writers
          would think it ridiculous to say that Goethe or Flaubert are unworthy
          of study for their omission in this map; this is simply an analysis of
          American culture, which I leave to you, the user.
        </p>
        <p>
          I would also include "Total time spent in the United States" if
          someone were to reasonably consider expatriate status as in the case
          of Henry James, Ezra Pound and T. S. Eliot, however getting accurate
          data for a consistent timeline is both woefully time-consuming and
          difficult, if not for the well-researched writers than for most
          writers in the corpus. It would be a question of ignoring gaps in the
          timeline, or only subtracting explicit sojourns in the timeline, and
          by then the question becomes so complicated it is liable to confuse
          the user than not.
        </p>
        <p>
          In fact, I would not be surprised if this feature is a little finicky
          if there is no immediate timeline event after the author's birth.
        </p>
        <p>"Months" seems to be a grandular enough unit of time for this.</p>
      </>
    ),
    [],
  );

  const { inclusionReasons, groupId, eventTypes, search, yearRange } = filters;

  return (
    <SideDrawer
      className={clsx('authorMapFilterSideDrawer', className)}
      title="Filters"
      opened={opened}
      onClose={onClose}
    >
      <details>
        <summary>Events</summary>
        <HelpButton
          className="eventsHelp"
          onClick={() => setExplanationOpened({ type: 'eventType' })}
        />
        <Radiogroup<AuthorTimelineEvent['type']>
          id={eventTypeId}
          className="authorFilterDrawerEventType"
          options={eventOptions}
          selected={filters.eventTypes}
          type="checkbox"
          onChange={(value) => {
            if (eventTypes.includes(value)) {
              onFiltersChange({
                ...filters,
                eventTypes: eventTypes.filter((type) => type !== value),
              });
            } else {
              onFiltersChange({
                ...filters,
                eventTypes: eventTypes.concat(value),
              });
            }
          }}
        />
      </details>

      <details>
        <summary>Reasons for inclusion</summary>
        <InclusionReasonSelect
          id={inclusionFilterId}
          selected={inclusionReasons}
          onSelectedChange={(inclusionReasons) => {
            onFiltersChange({ ...filters, inclusionReasons });
          }}
        />
      </details>

      <details>
        <summary>Formula</summary>
        <Formula
          value={filters.formula}
          onChange={(formula) => onFiltersChange({ ...filters, formula })}
        />
      </details>

      <details>
        <summary>Search</summary>
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
      </details>

      <details>
        <summary>Groups</summary>
        <SelectAuthorGroup
          id={groupsFilterId}
          value={groupId}
          onSelect={(value) => {
            onFiltersChange({
              ...filters,
              groupId: value?.id ?? undefined,
            });
          }}
        />
      </details>

      <details>
        <summary>Year range</summary>
        <YearRange
          id={yearRangeId}
          startingYear={data.dateRange[0]}
          endingYear={data.dateRange[1]}
          value={yearRange}
          onYearRangeChange={(startingYear, endingYear) => {
            onFiltersChange({
              ...filters,
              yearRange: [startingYear, endingYear],
            });
          }}
        />
      </details>

      <details>
        <summary>Minimum stay in residence</summary>
        <HelpButton
          className="eventsHelp"
          onClick={() => setExplanationOpened({ type: 'minResidence' })}
        />
        <div className="minimumResidence">
          <input
            id={minimumResidenceId}
            type="number"
            min={0}
            value={filters.minimumResidence}
            onChange={(event) => {
              if (event.target.checkValidity()) {
                const minimumResidence = Number(event.target.value);

                onFiltersChange({ ...filters, minimumResidence });
              } else {
                onFiltersChange({ ...filters, minimumResidence: undefined });
              }
            }}
          />
          months
        </div>
      </details>

      <details>
        <summary>Time until immigration to States</summary>
        <HelpButton
          className="eventsHelp"
          onClick={() => setExplanationOpened({ type: 'timeUntilImmigration' })}
        />
        <div className="timeUntilImmigration">
          <input
            id={timeUntilImmigrationId}
            type="number"
            min={0}
            value={filters.timeUntilImmigration}
            onChange={(event) => {
              if (event.target.checkValidity()) {
                const timeUntilImmigration = Number(event.target.value);

                onFiltersChange({ ...filters, timeUntilImmigration });
              } else {
                onFiltersChange({
                  ...filters,
                  timeUntilImmigration: undefined,
                });
              }
            }}
          />
          months
        </div>
      </details>

      <CommonModal
        className="eventsHelpModal"
        opened={explanationOpened?.type === 'eventType'}
        onClose={() => setExplanationOpened(undefined)}
      >
        {residingAuthorsExplanation}
      </CommonModal>

      <CommonModal
        className="eventsHelpModal"
        opened={explanationOpened?.type === 'minResidence'}
        onClose={() => setExplanationOpened(undefined)}
      >
        <h4>Filtering for minimum residence</h4>
        {minResidenceExplanation}
        <h4>Residence data</h4>
        {residingAuthorsExplanation}
      </CommonModal>

      <CommonModal
        className="eventsHelpModal"
        opened={explanationOpened?.type === 'timeUntilImmigration'}
        onClose={() => setExplanationOpened(undefined)}
      >
        <h4>Concept</h4>
        {timeUntilImmigrationExplanation}
        <h4>Residence data</h4>
        {residingAuthorsExplanation}
      </CommonModal>
    </SideDrawer>
  );
}
