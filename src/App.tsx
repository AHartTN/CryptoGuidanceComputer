/**
 * @fileoverview Main Application Component
 * @description Root component for the Apollo DSKY Cryptocurrency Computer
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DSKY from './features/dsky/components/DSKY';
import LogViewer from './components/LogViewer';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      gcTime: 300000,
    },
  },
});

/**
 * Main Application Component
 */
const App = React.memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<div className="App"><DSKY /></div>} />
          <Route path="/logs" element={<LogViewer />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App;
