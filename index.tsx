import ReactDOM from 'react-dom/client';

import { AuthorMap } from './src/AuthorMap';
import { useDemoData } from './useDemoData';

const App = () => {
  const {
    loading,
    authors,
    groups,
    timeline,
    cityCoordinates,
    entriesIntoUnion,
    stateCensus,
  } = useDemoData({
    type: 'JSON',
  });

  if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <>
        <AuthorMap
          className="authorMap"
          authors={authors}
          groups={groups}
          timeline={timeline}
          cityCoordinates={cityCoordinates}
          entriesIntoUnion={entriesIntoUnion}
          stateCensus={stateCensus}
          syncAuthorUpdate={async (author) => {
            console.log('author updated', author);

            await new Promise((resolve) => setTimeout(resolve, 1000));
          }}
          syncAuthorAdded={(author) => {
            console.log('author added', author);

            author.author.id = Symbol();
          }}
          /*
        onGroupCreated={(group) =>
          setGroups((currentGroups) =>
            currentGroups.concat({
              ...group,
              id: Symbol(`Group ID for ${group.name}`),
            }),
          )
        }
          */
          onGroupUpdated={(group) => {
            /*setGroups((currentGroups) => {
            const index = currentGroups.findIndex(
              (currentGroup) => currentGroup.id === group.id,
            );

            return [
              ...currentGroups.slice(0, index),
              group,
              ...currentGroups.slice(index + 1),
            ];
          });
          */
          }}
          /*
        onTimelineEventCreated={(event) =>
          setTimeline((currentEvents) =>
            currentEvents.concat({
              ...event,
              id: Symbol(`Event ID for ${event.notes}`),
            }),
          )
        }
          */
          onTimelineEventUpdated={(event) => {
            /*
          setTimeline((currentEvents) => {
            const index = currentEvents.findIndex(
              (currentEvent) => currentEvent.id === event.id,
            );

            return [
              ...currentEvents.slice(0, index),
              event,
              ...currentEvents.slice(index + 1),
            ];
          });
          */
          }}
        />
      </>
    );
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
