import styles from './AuthorTimelineView.module.css';

import {
  Fragment,
  JSX,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { AuthorMapDataContext } from '../../contexts';
import { Author, BirthEvent, DeathEvent, MilestoneEvent } from '../../models';
import { getAuthorName } from '../../utils/names';
import { formatDate } from '../../utils/dates';
import { getImageFromCache } from '../../utils/images';

interface Props {
  year: number;
  dataRow: number;

  show?: boolean;
  events?: Array<BirthEvent | DeathEvent | MilestoneEvent>;
  onHeightCalculated?: (height: number) => void;
}

export function AuthorTimelineEntry({
  year,
  dataRow,
  events,
  show,
}: Props): JSX.Element {
  const { data: statesData } = useContext(AuthorMapDataContext);

  const itemRef = useRef<HTMLLIElement | null>(null);

  const [calculatedHeight, setCalculatedHeight] = useState<
    number | undefined
  >();

  const [authorImages, setAuthorImages] = useState<
    Map<Author['id'], string> | undefined
  >();

  useLayoutEffect(() => {
    const itemElement = itemRef.current;
    if (itemElement && show && !calculatedHeight) {
      setCalculatedHeight(itemElement.offsetHeight);
    }
  }, [calculatedHeight, setCalculatedHeight, itemRef, show]);

  useEffect(() => {
    if (show && events && !authorImages) {
      (async () => {
        const map: Map<Author['id'], string> = new Map();

        for (const event of events) {
          if (event.authorId) {
            const author = statesData.getAuthor(event.authorId);

            if (author.portrait?.src) {
              map.set(author.id, await getImageFromCache(author.portrait.src));
            }
          }
        }

        setAuthorImages(map);
      })();
    }
  }, [show, events, statesData, authorImages, setAuthorImages]);

  return (
    <li
      className={styles.authorTimelineViewEntry}
      data-row={dataRow}
      key={year}
      ref={itemRef}
      style={{
        height: calculatedHeight,
      }}
    >
      {show && (
        <>
          <h4 className={styles.authorTimelineViewYear}>{year}</h4>
          <div className={styles.authorTimelineViewEntryBullet}></div>
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
                <div className={styles.authorTimelineEventDate}>
                  {formatDate(event.date, event.location?.state, {
                    dateOnly: true,
                  })}
                </div>

                <div className={styles.authorTimelineEntryBisector}></div>

                <div className={styles.authorTimelineViewEntryDetails}>
                  {author && (
                    <h4 className={styles.authorTimelineViewAuthorHeader}>
                      {getAuthorName(author)}
                      {authorImages && (
                        <img
                          className={styles.authorTimelineViewPortrait}
                          {...author.portrait}
                          src={authorImages.get(author.id)}
                        />
                      )}
                    </h4>
                  )}

                  <p>{note}</p>
                </div>
              </Fragment>
            );
          })}
        </>
      )}
    </li>
  );
}
