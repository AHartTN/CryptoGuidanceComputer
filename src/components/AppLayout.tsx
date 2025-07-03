/**
 * @file AppLayout.tsx
 * @description Main application layout component for Apollo DSKY Crypto Guidance Computer.
 * Provides the overall structure, navigation, and footer for the app.
 *
 * @module AppLayout
 */

import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import WalletMetadata from "./WalletMetadata";

/**
 * Main application layout component.
 * Renders header, navigation, metadata, sidebar, and footer.
 *
 * @returns {JSX.Element} The rendered layout.
 */
export const AppLayout: React.FC = () => {
  const [sideOpen, setSideOpen] = useState(true);
  return (
    <div className="app-root-layout">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">🚀 DSKY</span>
          <nav className="app-menu">
            <Link to="/">DSKY</Link>
            <Link to="/logs">Logs</Link>
            <Link to="/performance">Performance</Link>
            <Link to="/realtime">Real-Time</Link>
            <Link to="/output">Output</Link>
            <Link to="/debug">Debug</Link>
          </nav>
        </div>
        <div className="app-header-right">
          <span className="login-placeholder">[Login]</span>
        </div>
      </header>
      <section className="app-metadata">
        <WalletMetadata />
      </section>
      <div className="app-main-layout">
        <aside className={`app-side-panel${sideOpen ? "" : " collapsed"}`}>
          <button
            className="side-toggle"
            onClick={() => setSideOpen((o) => !o)}
          >
            {sideOpen ? "⏴" : "⏵"}
          </button>
          {sideOpen && (
            <nav className="side-nav">
              <Link to="/">DSKY</Link>
              <Link to="/logs">Logs</Link>
              <Link to="/performance">Performance</Link>
              <Link to="/realtime">Real-Time</Link>
              <Link to="/output">Output</Link>
              <Link to="/debug">Debug</Link>
            </nav>
          )}
        </aside>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <footer className="app-footer">
        <span>
          © {new Date().getFullYear()} Apollo DSKY Crypto Guidance Computer
        </span>
      </footer>
    </div>
  );
};

export default AppLayout;
