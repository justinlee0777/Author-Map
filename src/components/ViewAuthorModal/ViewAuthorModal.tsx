import { Fragment, JSX, ReactNode, useContext } from 'react';
import { Author } from '../../models';
import { getAuthorName } from '../../utils/names';
import { formatDate } from '../../utils/dates';
import { getAddress } from '../../utils/address';
import { AuthorGroupContext, AuthorMapDataContext } from '../../contexts';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  appElement: HTMLElement;
  opened: boolean;
  author: Author;

  onClose?: () => void;
}

export function ViewAuthorModal({
  appElement,
  opened,
  onClose,
  author,
}: Props): JSX.Element {
  const { data } = useContext(AuthorMapDataContext);

  const { groups } = useContext(AuthorGroupContext);

  let authorNameElement: ReactNode = getAuthorName(author);

  if (author.link) {
    authorNameElement = (
      <a href={author.link} target="_blank" rel="noopener noreferrer">
        {authorNameElement}
      </a>
    );
  }

  const events = data.getAuthorTimeline(author.id, true);

  const birthDate = data.getBirthDate(author.id),
    deathDate = data.getDeathDate(author.id);

  return (
    <CommonModal opened={opened} appElement={appElement} onClose={onClose}>
      <div className="viewAuthorModal">
        <div className="viewAuthorPortraitContainer">
          {author.portrait?.src && (
            <img src={author.portrait?.src} loading="lazy" />
          )}
        </div>

        <h4>Name</h4>
        <p>{authorNameElement}</p>

        {birthDate && (
          <>
            <h4>Birth</h4>
            <p>{formatDate(birthDate.date)}</p>
            {birthDate.location && <p>{getAddress(birthDate.location)}</p>}
            {birthDate.notes && <p>{birthDate.notes}</p>}
          </>
        )}

        {deathDate && (
          <>
            <h4>Death</h4>
            <p>{formatDate(deathDate.date)}</p>
            {deathDate.location && <p>{getAddress(deathDate.location)}</p>}
            {deathDate.notes && <p>{deathDate.notes}</p>}
          </>
        )}

        <h4>Reasons for inclusion</h4>
        {author.inclusionReasons.map((inclusionReason) => {
          switch (inclusionReason.type) {
            case 'Poet Laureate':
              return (
                <p key="poet-laureate">
                  <a href={inclusionReason.referenceUrl}>Poet laureate</a> -{' '}
                  {inclusionReason.dates
                    .map(
                      ({ startYear, endYear }) =>
                        `${startYear}${endYear && ` - ${endYear}`}`,
                    )
                    .join(', ')}
                </p>
              );
            case 'Published as classical literature':
              return (
                <Fragment key="publisher">
                  <p>Published by:</p>
                  {Object.entries(inclusionReason.publishers).map(
                    ([publisher, catalog]) => {
                      return (
                        <div key={publisher} className="publisherList">
                          <p>
                            <b>{publisher}</b>
                          </p>
                          <ul>
                            {catalog.books.map((book) => (
                              <li key={book.name}>
                                <a href={book.referenceUrl}>{book.name}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    },
                  )}
                </Fragment>
              );
            case 'award':
              return (
                <p key={`${inclusionReason.type}-${inclusionReason.award}`}>
                  Awarded{' '}
                  <a href={inclusionReason.referenceUrl}>
                    {inclusionReason.award}
                  </a>{' '}
                  {inclusionReason.year}
                  {inclusionReason.book && (
                    <> for {`"${inclusionReason.book}"`}</>
                  )}
                </p>
              );
            default:
              console.log(
                'Inclusion reason has no rendering code.',
                inclusionReason,
              );
              throw new Error('Cannot render.');
          }
        })}

        {events.length > 0 && (
          <>
            <h4>Timeline</h4>
            {/* TODO: This should be like a miniature Timeline component. */}
            {events.map((event, i) => {
              let eventElement: ReactNode;

              switch (event.type) {
                case 'Timeline':
                  eventElement = `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
                  break;
                case 'Milestone':
                default:
                  eventElement = formatDate(event.date);
                  break;
              }

              if (event.notes) {
                eventElement = (
                  <>
                    {eventElement} - {event.notes}
                  </>
                );
              }

              return (
                <Fragment key={i}>
                  <p>{eventElement}</p>
                </Fragment>
              );
            })}
          </>
        )}

        {Number(author.groups?.length) > 0 && (
          <>
            <h4>Grouped with</h4>

            {author.groups!.map((groupId, i) => {
              const existingGroup = groups.find(
                (group) => group.id === groupId,
              )!;

              let groupNameElement: ReactNode = existingGroup.name;

              if (existingGroup.link) {
                groupNameElement = (
                  <a
                    href={existingGroup.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {groupNameElement}
                  </a>
                );
              }

              return (
                <Fragment key={i}>
                  <h5>{groupNameElement}</h5>
                  {existingGroup.span && (
                    <p>
                      {formatDate(existingGroup.span.startDate)} -{' '}
                      {formatDate(existingGroup.span.endDate)}
                    </p>
                  )}
                  <p>{existingGroup.description}</p>
                </Fragment>
              );
            })}
          </>
        )}
      </div>
    </CommonModal>
  );
}
