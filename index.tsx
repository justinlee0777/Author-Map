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
        />
      </>
    );
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
