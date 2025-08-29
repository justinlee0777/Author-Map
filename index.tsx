import React from 'react';
import ReactDOM from 'react-dom/client';

import { AuthorMap } from './src/AuthorMap';

const App = () => <AuthorMap />;

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
