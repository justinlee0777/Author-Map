import styles from './StateDrawer.module.css';
import commonStyles from '../../common.module.css';

import clsx from 'clsx';
import { Fragment, JSX, ReactNode, useMemo } from 'react';
import { AuthorData, StateStore, USState } from '../../models';
import { AuthorStores, createKeyGenerator } from '../../utils/stores';
import { MdAdd, MdClose } from 'react-icons/md';
import { getAuthorName } from '../../utils/names';

interface Props {
  usState: USState;
  statesData: AuthorStores;
  statesDataKey: keyof StateStore;

  showContext?: boolean;
  onClose?: () => void;
  onEdit?: (authorData: AuthorData) => void;
  onAddAuthor?: () => void;
}

export function StateDrawer({
  usState,
  statesData,
  statesDataKey,
  showContext,
  onClose,
  onEdit,
  onAddAuthor,
}: Props): JSX.Element {
  const authorKeyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <div className={clsx(styles.stateDrawerUSState, commonStyles.sideDrawer)}>
      <button
        className={clsx(commonStyles.button, styles.stateDrawerAdd)}
        onClick={onAddAuthor}
      >
        <MdAdd />
      </button>
      <h3>
        {usState}

        <button
          className={clsx(commonStyles.button, styles.stateDrawerClose)}
          onClick={onClose}
        >
          <MdClose />
        </button>
      </h3>
      <div className={styles.stateDrawerList}>
        {statesData.get(usState)![statesDataKey].map((author, i) => {
          let authorName: ReactNode = getAuthorName(author);

          if (author.link) {
            authorName = (
              <a href={author.link} target="_blank" rel="noopener noreferrer">
                {authorName}
              </a>
            );
          }

          return (
            <div
              key={authorKeyGenerator.getKey(author.id)}
              className={styles.stateDrawerAuthorRow}
            >
              {author.portrait && <img {...author.portrait} />}
              <div className={styles.stateDrawerAuthorDetails}>
                <p>{authorName}</p>
                {author.events.map(({ date, context, address }, index) => {
                  return (
                    <Fragment key={index}>
                      <div className={styles.stateDrawerRelevantEvent}>
                        <div className={styles.stateDrawerRelevantEventContext}>
                          <p>
                            <b>{date}</b>
                          </p>
                          <p>{address}</p>
                        </div>
                        {showContext && <span>{context}</span>}
                      </div>
                    </Fragment>
                  );
                })}
              </div>

              <button
                className={clsx(commonStyles.button, styles.stateDrawerEdit)}
                onClick={() => onEdit?.(author)}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
