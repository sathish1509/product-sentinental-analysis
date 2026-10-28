import React from 'react';

export const Button = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
  
  const variants = {
    default: 'bg-zinc-950 text-white shadow-sm hover:bg-zinc-800 font-semibold',
    destructive: 'bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 font-semibold border border-zinc-900',
    outline: 'border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:border-zinc-300',
    secondary: 'bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-200',
    ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
    link: 'text-zinc-950 underline-offset-4 hover:underline font-semibold',
    accent: 'bg-zinc-950 text-white shadow-md hover:bg-zinc-800 font-semibold'
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-lg px-6 text-sm',
    icon: 'h-9 w-9 p-0'
  };

  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.default;

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
