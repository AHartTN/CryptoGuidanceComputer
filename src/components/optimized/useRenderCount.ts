import React from 'react';

export const useRenderCount = (componentName: string) => {
  const renderCount = React.useRef(0);
  renderCount.current++;
  React.useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });
  return renderCount.current;
};
