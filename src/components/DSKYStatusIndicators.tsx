/**
 * @fileoverview DSKY Status Indicators Component
 * @description Apollo DSKY-style status lights and indicators
 */

import React from 'react';
import type { IDSKYState, StatusLightKey } from '../types';
import { STATUS_INDICATORS } from '../constants';

/**
 * Props for the DSKY Status Indicators component
 */
interface DSKYStatusIndicatorsProps {
  /** Current DSKY state containing status light values */
  dskyState: IDSKYState;
}

/**
 * Props for individual status light components
 */
interface StatusLightProps {
  /** Status light identifier */
  lightKey: StatusLightKey;
  /** Display label for the light */
  label: string;
  /** Whether the light is currently active */
  isActive: boolean;
}

/**
 * Individual status light component with memoization
 */
const StatusLight = React.memo<StatusLightProps>(({ lightKey, label, isActive }) => (
  <div
    className={`dsky-status-light status-${lightKey.toLowerCase().replace(/([A-Z])/g, '-$1')} ${
      isActive ? 'active' : ''
    }`}
  >
    {label}
  </div>
));

StatusLight.displayName = 'StatusLight';

/**
 * Main DSKY Status Indicators component with optimization
 */
export const DSKYStatusIndicators = React.memo<DSKYStatusIndicatorsProps>(({ dskyState }) => {
  return (
    <div className="dsky-status-indicators">
      <div className="dsky-status-grid">
        <div className={`dsky-status-light status-comp-acty ${dskyState.compActy ? 'active' : ''}`}>
          COMP ACTY
        </div>
        {STATUS_INDICATORS.map((light) => (
          <StatusLight
            key={light.key}
            lightKey={light.key as StatusLightKey}
            label={light.label}
            isActive={dskyState[light.key as keyof IDSKYState] as boolean}
          />
        ))}
      </div>
    </div>
  );
});

DSKYStatusIndicators.displayName = 'DSKYStatusIndicators';
