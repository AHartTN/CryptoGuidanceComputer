/**
 * @fileoverview Main Application Component
 * @description Root component for the Apollo DSKY Cryptocurrency Computer
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DSKYAuthentic from './components/DSKYAuthentic';
import './App.css';

// Create optimized query client with aggressive caching for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 30000, // 30 seconds default stale time
      gcTime: 300000, // 5 minutes garbage collection time
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
        <DSKYAuthentic />
      </div>
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App;
