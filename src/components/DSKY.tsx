/**
 * @file DSKY.tsx
 * @description Apollo DSKY (Display and Keyboard) UI component for the Crypto Guidance Computer.
 * Renders the DSKY interface, including status indicators, display, and keypad.
 *
 * @module DSKY
 */

import React from "react";
import "../styles/dsky.css";
import "../styles/dsky-base.css";
import "../styles/dsky-layout.css";
import "../styles/dsky-status-indicators.css";
import "../styles/dsky-display.css";
import "../styles/dsky-keypad.css";

/**
 * Status indicator labels for the DSKY UI.
 * @constant
 */
const statusLabels = [
  "COMP ACTY", "UPLINK ACTY",
  "NO ATT", "STBY",
  "KEY REL", "OPR ERR",
  "TEMP", "GIMBAL LOCK",
  "PROG", "RESTART",
  "TRACKER", "ALT",
  "VEL", " ", // 14 lights, last is blank for symmetry
];

/**
 * Keypad layout for the DSKY UI.
 * @constant
 */
const keypad = [
  ["VERB", "+", "7", "8", "9"],
  ["NOUN", "-", "4", "5", "6"],
  ["0", "1", "2", "3", "CLR"],
  [null, null, "PRO", "ENTR", "RSET"],
  [null, null, null, "KEY REL", null]
];

/**
 * DSKY component.
 * Renders the Apollo DSKY interface with status indicators, display, and keypad.
 *
 * @returns {JSX.Element} The rendered DSKY UI.
 */
export default function DSKY() {
  return (
    <div className="dsky-bezel dsky-fade-in">
      <div className="dsky-screws dsky-screw-tl" />
      <div className="dsky-screws dsky-screw-tr" />
      <div className="dsky-screws dsky-screw-bl" />
      <div className="dsky-screws dsky-screw-br" />
      <div className="dsky-faceplate">
        <div className="dsky-faceplate-main-row">
          {/* Status Indicator Grid */}
          <div className="dsky-status-indicators">
            {statusLabels.map((label, idx) => (
              <div
                className={
                  "dsky-status-light" +
                  (label === "COMP ACTY" ? " comp-acty" : "") +
                  (label.trim() ? ` status-${label.toLowerCase().replace(/\s+/g, "-")}` : "")
                }
                key={label + idx}
              >
                <span className="dsky-status-light-label">{label}</span>
              </div>
            ))}
          </div>
          {/* Main Display */}
          <div className="dsky-display">
            <div className="dsky-display-header-row">
              <span className="dsky-display-label seven-segment align-end">PROG</span>
              <span className="dsky-display-value seven-segment align-start">00</span>
              <span className="dsky-display-label seven-segment align-end">VERB</span>
              <span className="dsky-display-value seven-segment align-start">00</span>
              <span className="dsky-display-label seven-segment align-end">NOUN</span>
              <span className="dsky-display-value seven-segment align-start">00</span>
            </div>
            <div className="dsky-display-numeric-rows">
              <span className="dsky-display-value seven-segment full-width">+00000</span>
              <span className="dsky-display-value seven-segment full-width">+00000</span>
              <span className="dsky-display-value seven-segment full-width">+00000</span>
            </div>
          </div>
        </div>
        {/* Keypad below, centered */}
        <div className="dsky-keypad-row">
          <div className="dsky-keypad-grid">
            {keypad.map((row, i) => (
              <div className="dsky-keypad-row" key={i}>
                {row.map((key, j) =>
                  key ? (
                    <button
                      className={
                        "dsky-button seven-segment" +
                        (key === "VERB" ? " btn-verb" : "") +
                        (key === "NOUN" ? " btn-noun" : "") +
                        (key === "PRO" ? " btn-proc" : "") +
                        (key === "RSET" ? " btn-rset" : "") +
                        (key === "ENTR" ? " btn-entr" : "") +
                        (key === "CLR" ? " btn-clr" : "") +
                        (key === "KEY REL" ? " btn-key-rel" : "") +
                        (["0","1","2","3","4","5","6","7","8","9"].includes(key) ? ` btn-${key}` : "") +
                        (key === "+" ? " btn-plus" : "") +
                        (key === "-" ? " btn-minus" : "")
                      }
                      key={key + i + j}
                    >
                      {key}
                    </button>
                  ) : (
                    <span className="dsky-button dsky-hidden" key={j}></span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
