import React from 'react';

interface DSKYRegistersProps {
  reg1: string;
  reg2: string;
  reg3: string;
}

const DSKYRegisters: React.FC<DSKYRegistersProps> = ({ reg1, reg2, reg3 }) => {
  const registers = [
    { label: 'R1', value: reg1, unit: '' },
    { label: 'R2', value: reg2, unit: 'ETH' },
    { label: 'R3', value: reg3, unit: 'BLK' }
  ];

  return (
    <div className="dsky-registers">
      {registers.map((register) => (
        <div key={register.label} className="dsky-register-row">
          <div className="dsky-register-label">{register.label}</div>
          <div 
            className="dsky-register-value"
            aria-label={`Register ${register.label}: ${register.value} ${register.unit}`.trim()}
          >
            <span>{register.value}</span>
          </div>
          {register.unit && (
            <div className="dsky-register-unit">{register.unit}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DSKYRegisters;
