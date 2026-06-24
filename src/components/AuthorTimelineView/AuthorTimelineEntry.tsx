import { Fragment, JSX, useContext } from 'react';

import { AuthorMapDataContext } from '../../contexts';
import type {
  Author,
  BirthEvent,
  DeathEvent,
  MilestoneEvent,
} from '../../models';
import { getAuthorName } from '../../utils/names';
import { formatDate } from '../../utils/dates';

interface Props {
  year: number;

  events?: Array<BirthEvent | DeathEvent | MilestoneEvent>;
  onAuthorView?: (author: Author) => void;
}

export function AuthorTimelineEntry({
  year,
  events,
  onAuthorView,
}: Props): JSX.Element {
  const { data: statesData } = useContext(AuthorMapDataContext);

  return (
    <li className="authorTimelineViewEntry" key={year}>
      {
        <>
          <h4 className="authorTimelineViewYear">{year}</h4>
          <div className="authorTimelineViewEntryBullet"></div>
          {events?.map((event, i) => {
            const author = event.authorId
              ? statesData.getAuthor(event.authorId)
              : undefined;

            let note: string;

            switch (event.type) {
              case 'Birth':
                note = 'Birth';
                break;
              case 'Death':
                note = 'Death';
                break;
              default:
                note = event.notes ?? '';
                break;
            }

            return (
              <Fragment key={i}>
                <div className="authorTimelineEventDate">
                  {formatDate(event.date, {
                    dateOnly: true,
                  })}
                </div>

                <div className="authorTimelineEntryBisector"></div>

                <div className="authorTimelineViewEntryDetails">
                  {author && (
                    <h4 className="authorTimelineViewAuthorHeader">
                      {getAuthorName(author)}
                      <img
                        className="authorTimelineViewPortrait"
                        {...author.portrait}
                        height={48}
                        width={48}
                        loading="lazy"
                      />
                      <button
                        className="authorTimelineViewAction"
                        onClick={() => onAuthorView?.(author)}
                      >
                        View
                      </button>
                    </h4>
                  )}

                  <p>{note}</p>
                </div>
              </Fragment>
            );
          })}
        </>
      }
    </li>
  );
}
