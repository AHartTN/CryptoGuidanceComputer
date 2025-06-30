import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DSKY from './components/DSKY';
import './App.css';

// Create optimized query client with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 30000, // 30 seconds default stale time
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <DSKY />
      </div>
    </QueryClientProvider>
  );
}

export default App;
