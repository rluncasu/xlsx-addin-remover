import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'muted';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'primary', 
  className = '' 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center px-2 py-2 rounded-full font-semibold text-xs leading-none whitespace-nowrap aspect-square min-w-[1.5rem] min-h-[1.5rem]';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-success-500 text-white',
    error: 'bg-error-500 text-white',
    muted: 'bg-gray-100 text-gray-600',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
