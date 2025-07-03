// LogViewer.tsx - Client-side log viewer for DSKY logs
import React, { useEffect, useState } from 'react';
import { getLogsFromDb, clearLogsDb, LogDbEntry } from '../utils/logDb';

const LEVEL_COLORS: Record<number, string> = {
  0: '#888', // DEBUG
  1: '#00bfff', // INFO
  2: '#ff8000', // WARN
  3: '#ff0080', // ERROR
  4: '#ff0000', // CRITICAL
};

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogDbEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    setLogs(await getLogsFromDb(200));
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div style={{ background: '#111', color: '#eee', padding: 16, fontFamily: 'monospace', minHeight: '100vh' }}>
      <h2>DSKY Log Viewer</h2>
      <button onClick={loadLogs} style={{ marginRight: 8 }}>Refresh</button>
      <button onClick={async () => { await clearLogsDb(); loadLogs(); }}>Clear Logs</button>
      {loading ? <div>Loading...</div> : (
        <div style={{ marginTop: 16 }}>
          {logs.length === 0 ? <div>No logs found.</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#222' }}>
                  <th style={{ color: '#fff' }}>Time</th>
                  <th style={{ color: '#fff' }}>Level</th>
                  <th style={{ color: '#fff' }}>Category</th>
                  <th style={{ color: '#fff' }}>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ background: '#181818' }}>
                    <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td style={{ color: LEVEL_COLORS[log.level] }}>{log.level}</td>
                    <td>{log.category}</td>
                    <td style={{ maxWidth: 600, wordBreak: 'break-word' }}>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default LogViewer;
