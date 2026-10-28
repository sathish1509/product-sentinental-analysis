import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200/70 ${className}`}
      {...props}
    />
  );
};
