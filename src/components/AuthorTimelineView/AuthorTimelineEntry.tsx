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
          <h2 className="authorTimelineViewYear">{year}</h2>
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
                    <h3 className="authorTimelineViewAuthorHeader">
                      {getAuthorName(author)}
                      <img
                        className="authorTimelineViewPortrait"
                        {...author.portrait}
                        height={48}
                        width={48}
                        loading="lazy"
                        alt={`Portrait of ${getAuthorName(author)}`}
                      />
                      <button
                        className="authorTimelineViewAction"
                        onClick={() => onAuthorView?.(author)}
                      >
                        View
                      </button>
                    </h3>
                  )}

                  {author ? <p>{note}</p> : <h4>{note}</h4>}
                </div>
              </Fragment>
            );
          })}
        </>
      }
    </li>
  );
}
