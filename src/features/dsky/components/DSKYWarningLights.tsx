import React from 'react';
import { IDSKYWarningLights } from '../../../interfaces/IDSKYCore';

interface DSKYWarningLightsProps {
  lights: IDSKYWarningLights;
}

const DSKYWarningLights: React.FC<DSKYWarningLightsProps> = ({ lights }) => {
  const warningLightData = [
    { key: 'uplinkActy', label: 'UPLINK ACTY', active: lights.uplinkActy },
    { key: 'temp', label: 'TEMP', active: lights.temp },
    { key: 'noAtt', label: 'NO ATT', active: lights.noAtt },
    { key: 'gimbalLock', label: 'GIMBAL LOCK', active: lights.gimbalLock },
    { key: 'stby', label: 'STBY', active: lights.stby },
    { key: 'keyRel', label: 'KEY REL', active: lights.keyRel },
    { key: 'oprErr', label: 'OPR ERR', active: lights.oprErr },
    { key: 'compActy', label: 'COMP ACTY', active: lights.compActy },
    { key: 'restart', label: 'RESTART', active: lights.restart }
  ];

  return (
    <div className="dsky-warning-lights">
      {warningLightData.map((light) => (
        <div key={light.key} className="dsky-warning-group">
          <div 
            className={`dsky-warning-light ${light.active ? 'on' : 'off'} ${light.active ? 'pulsing' : ''}`}
            aria-label={`${light.label} ${light.active ? 'active' : 'inactive'}`}
            role="status"
            aria-live="polite"
          />
          <div className="dsky-warning-light-label">{light.label}</div>
        </div>
      ))}
    </div>
  );
};

export default DSKYWarningLights;
