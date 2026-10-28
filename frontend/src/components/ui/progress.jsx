import React from 'react';

export const Progress = React.forwardRef(({ className = '', value = 0, color = 'bg-zinc-900', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-200/60 ${className}`}
      {...props}
    >
      <div
        className={`h-full w-full flex-1 transition-all duration-300 ${color}`}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';
