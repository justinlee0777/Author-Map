import styles from './ViewAuthorModal.module.css';

import { Fragment, JSX, ReactNode, useContext } from 'react';
import { Author } from '../../models';
import Modal from 'react-modal';
import { MdClear } from 'react-icons/md';
import { getAuthorName } from '../../utils/names';
import { formatDate } from '../../utils/dates';
import { getAddress } from '../../utils/address';
import { AuthorGroupContext, AuthorMapDataContext } from '../../contexts';

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
    <Modal isOpen={opened} appElement={appElement}>
      <div className={styles.viewAuthorModal}>
        <button
          className={styles.viewAuthorCloseModal}
          type="button"
          onClick={onClose}
        >
          <MdClear />
        </button>
        <div className={styles.viewAuthorPortraitContainer}>
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
    </Modal>
  );
}
