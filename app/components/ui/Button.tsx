import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded border font-medium transition-all duration-200 cursor-pointer text-decoration-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 hover:border-primary-600',
    secondary: 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400',
    danger: 'bg-error-500 text-white border-error-500 hover:bg-error-600 hover:border-error-600',
    success: 'bg-success-500 text-white border-success-500 hover:bg-success-600 hover:border-success-600',
  };
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
