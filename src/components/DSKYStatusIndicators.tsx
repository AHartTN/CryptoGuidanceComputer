// DSKY Status Indicators Component following SOLID principles

import React from 'react';
import { IDSKYState } from '../hooks/useDSKYState';
import { STATUS_INDICATORS } from '../constants/DSKYConstants';

interface DSKYStatusIndicatorsProps {
  dskyState: IDSKYState;
}

export const DSKYStatusIndicators: React.FC<DSKYStatusIndicatorsProps> = ({ dskyState }) => {
  return (
    <div className="dsky-status-indicators">
      <div className="dsky-status-grid">
        <div className={`dsky-status-light status-comp-acty ${dskyState.compActy ? 'active' : ''}`}>
          COMP ACTY
        </div>
        {STATUS_INDICATORS.map((light) => (
          <div
            key={light.key}
            className={`dsky-status-light status-${light.key.toLowerCase().replace(/([A-Z])/g, '-$1')} ${
              dskyState[light.key] ? 'active' : ''
            }`}
          >
            {light.label}
          </div>
        ))}
      </div>
    </div>
  );
};
