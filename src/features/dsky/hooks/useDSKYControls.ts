import { useState, useCallback, Dispatch, SetStateAction } from 'react';

export function useDSKYControls(
  performance: { startTimer: (name: string) => () => void },
  realTimeData: { isConnected: boolean; connect: () => void; disconnect: () => void }
): {
  showHelp: boolean;
  setShowPerformanceDashboard: Dispatch<SetStateAction<boolean>>;
  showPerformanceDashboard: boolean;
  realTimeEnabled: boolean;
  debugMode: boolean;
  handleShowHelp: () => void;
  handleCloseHelp: () => void;
  toggleRealTime: () => void;
  togglePerformanceDashboard: () => void;
  toggleDebugMode: () => void;
} {
  const [showHelp, setShowHelp] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(realTimeData?.isConnected ?? false);
  const [debugMode, setDebugMode] = useState(false);

  const handleShowHelp = useCallback(() => setShowHelp(true), []);
  const handleCloseHelp = useCallback(() => setShowHelp(false), []);
  const toggleRealTime = useCallback(() => {
    const timer = performance.startTimer('toggle_realtime');
    setRealTimeEnabled((prev: boolean) => !prev);
    if (!realTimeEnabled && !realTimeData.isConnected) {
      realTimeData.connect();
    } else if (realTimeEnabled && realTimeData.isConnected) {
      realTimeData.disconnect();
    }
    timer();
  }, [realTimeEnabled, realTimeData, performance]);
  const togglePerformanceDashboard = useCallback(() => {
    setShowPerformanceDashboard((prev: boolean) => !prev);
  }, []);
  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev: boolean) => !prev);
  }, []);

  return {
    showHelp,
    setShowPerformanceDashboard,
    showPerformanceDashboard,
    realTimeEnabled,
    debugMode,
    handleShowHelp,
    handleCloseHelp,
    toggleRealTime,
    togglePerformanceDashboard,
    toggleDebugMode
  };
}
