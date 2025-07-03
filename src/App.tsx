/**
 * @fileoverview Main Application Component
 * @description Root component for the Apollo DSKY Cryptocurrency Computer
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DSKY from './features/dsky/components/DSKY';
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
      <div className="App">
        <DSKY />
      </div>
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App;
