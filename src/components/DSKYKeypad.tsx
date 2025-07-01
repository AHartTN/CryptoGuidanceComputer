import React from 'react';

interface DSKYKeypadProps {
  onKeyPress: (key: string) => void;
}

const DSKYKeypad: React.FC<DSKYKeypadProps> = ({ onKeyPress }) => {
  const numericKeys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '+', '−']
  ];

  const controlKeys = ['CLR', 'ENTR', 'RSET'];
  const specialKeys = ['VERB', 'NOUN', 'PRO'];

  return (
    <div className="dsky-keypad">
      {/* Special Function Keys - Top Row */}
      <div className="dsky-keypad-special">
        {specialKeys.map((key) => (
          <button
            key={key}
            className="dsky-button special"
            onClick={() => onKeyPress(key)}
            aria-label={`${key} button`}
          >
            <span>{key}</span>
          </button>
        ))}
      </div>

      {/* Numeric Keypad - Left Side */}
      <div className="dsky-keypad-numeric">
        {numericKeys.flat().map((key) => (
          <button
            key={key}
            className={`dsky-button ${/\d/.test(key) ? 'numeric' : 'operator'}`}
            onClick={() => onKeyPress(key)}
            aria-label={`${key} button`}
          >
            <span>{key}</span>
          </button>
        ))}
      </div>

      {/* Control Keys - Right Side */}
      <div className="dsky-keypad-controls">
        {controlKeys.map((key) => (
          <button
            key={key}
            className="dsky-button control"
            onClick={() => onKeyPress(key)}
            aria-label={`${key} button`}
          >
            <span>{key}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DSKYKeypad;
