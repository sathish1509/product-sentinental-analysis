import React from 'react';

export const Badge = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none';

  const variants = {
    default: 'border border-zinc-950 bg-zinc-950 text-white shadow-sm font-semibold',
    secondary: 'border border-zinc-200 bg-zinc-100 text-zinc-800 font-medium',
    destructive: 'border border-zinc-900 bg-zinc-900 text-white font-semibold',
    outline: 'text-zinc-800 border border-zinc-200 bg-white font-medium',
    success: 'border border-zinc-300 bg-zinc-100 text-zinc-900 font-semibold',
    warning: 'border border-zinc-300 bg-zinc-100 text-zinc-800 font-medium',
    info: 'border border-zinc-200 bg-zinc-100 text-zinc-800 font-medium',
    purple: 'border border-zinc-200 bg-zinc-100 text-zinc-800 font-medium'
  };

  const variantStyle = variants[variant] || variants.default;

  return (
    <div className={`${baseStyles} ${variantStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
