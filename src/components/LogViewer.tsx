/**
 * @file LogViewer.tsx
 * @description Log viewer component for Apollo DSKY Crypto Guidance Computer.
 * Displays application logs from IndexedDB and provides controls to refresh or clear logs.
 *
 * @module LogViewer
 */

import React, { useEffect, useState } from "react";
import { getLogsFromDb, clearLogsDb, LogDbEntry } from "../utils/logDb";
import "../styles/log-viewer.css";

/**
 * LogViewer component.
 * Renders a table of application logs and provides refresh/clear controls.
 *
 * @returns {JSX.Element} The rendered log viewer.
 */
export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogDbEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Loads logs from IndexedDB.
   * @async
   */
  const loadLogs = async () => {
    setLoading(true);
    setLogs(await getLogsFromDb(200));
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="app-content">
      <div className="log-viewer-container">
        <h2>DSKY Log Viewer</h2>
        <button onClick={loadLogs} className="log-viewer-btn log-viewer-btn-refresh">
          Refresh
        </button>
        <button
          onClick={async () => {
            await clearLogsDb();
            loadLogs();
          }}
          className="log-viewer-btn log-viewer-btn-clear"
        >
          Clear Logs
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="log-viewer-table-wrapper">
            {logs.length === 0 ? (
              <div>No logs found.</div>
            ) : (
              <table className="log-viewer-table">
                <thead>
                  <tr className="log-viewer-table-header-row">
                    <th className="log-viewer-table-header">Time</th>
                    <th className="log-viewer-table-header">Level</th>
                    <th className="log-viewer-table-header">Category</th>
                    <th className="log-viewer-table-header">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="log-viewer-table-row">
                      <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className={`log-viewer-table-level log-level-${log.level}`}>{log.level}</td>
                      <td>{log.category}</td>
                      <td className="log-viewer-table-message">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
