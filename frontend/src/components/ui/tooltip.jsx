import React, { useState } from 'react';

export const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip = ({ children, delayDuration = 150 }) => {
  const [open, setOpen] = useState(false);
  let timeoutId = null;

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => setOpen(true), delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setOpen(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === TooltipTrigger) {
          return child;
        }
        if (child.type === TooltipContent) {
          return open ? child : null;
        }
        return child;
      })}
    </div>
  );
};

export const TooltipTrigger = ({ children, asChild, ...props }) => {
  return (
    <div className="inline-flex cursor-pointer" {...props}>
      {children}
    </div>
  );
};

export const TooltipContent = ({ className = '', children, side = 'top', ...props }) => {
  const sidePositions = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  const positionClass = sidePositions[side] || sidePositions.top;

  return (
    <div
      className={`absolute z-50 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-100 shadow-xl pointer-events-none whitespace-nowrap ${positionClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
