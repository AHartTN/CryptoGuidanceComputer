import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DSKY from "./components/DSKY";
import LogViewer from "./components/LogViewer";
import AppLayout from "./components/AppLayout";
import PerformanceDashboard from "./components/PerformanceDashboard";
import RealTimeDashboard from "./components/RealTimeDashboard";
import OutputPage from "./components/OutputPage";
import DebugPage from "./components/DebugPage";
import "./App.css";

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

const App = React.memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DSKY />} />
            <Route path="logs" element={<LogViewer />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="realtime" element={<RealTimeDashboard />} />
            <Route path="output" element={<OutputPage />} />
            <Route path="debug" element={<DebugPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
});

App.displayName = "App";

export default App;
