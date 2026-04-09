import styles from './ViewAuthorModal.module.css';

import { Fragment, JSX, ReactNode, useContext } from 'react';
import { Author, AuthorAchievementType, MilestoneEvent } from '../../models';
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

  const achievements = data
    .getAuthorTimeline(author)
    .filter((event) => Boolean(event.achievement)) as Array<MilestoneEvent>;

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

        {achievements.length > 0 && (
          <>
            <h4>Known for</h4>
            {achievements.map(({ date, achievement }, i) => {
              let titleElement: ReactNode;

              switch (achievement!.type) {
                case AuthorAchievementType.AWARD:
                  titleElement = achievement!.awardName;
                  break;
                case AuthorAchievementType.RENOWNED_WORK:
                default:
                  titleElement = achievement!.workTitle;

                  if (achievement!.referenceUrl) {
                    titleElement = (
                      <a
                        href={achievement!.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {titleElement}
                      </a>
                    );
                  }
                  break;
              }

              return (
                <Fragment key={i}>
                  <p>
                    {formatDate(date)} - {titleElement}
                  </p>
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
