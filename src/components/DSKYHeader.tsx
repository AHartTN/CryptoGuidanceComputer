import React from 'react';

interface DSKYHeaderProps {
  title?: string;
  subtitle?: string;
  model?: string;
}

const DSKYHeader: React.FC<DSKYHeaderProps> = ({ 
  title = "CRYPTO GUIDANCE COMPUTER",
  subtitle = "DISPLAY & KEYBOARD INTERFACE", 
  model = "BLOCKCHAIN GUIDANCE SYSTEM"
}) => {
  return (
    <div className="dsky-header">
      <h1 className="dsky-header-title">{title}</h1>
      <h2 className="dsky-header-subtitle">{subtitle}</h2>
      <div className="dsky-header-version">{model}</div>
    </div>
  );
};

export default DSKYHeader;
