import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'info', 
  title,
  className = '' 
}: AlertProps) {
  const baseClasses = 'border rounded-lg p-4 mb-6';
  
  const variantClasses = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };
  
  const iconClasses = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };
  
  const textClasses = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };
  
  const bodyTextClasses = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700',
  };

  const icons = {
    success: '✅',
    error: '⚠️',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={classes}>
      <div className="flex items-start">
        <div className={`text-xl mr-3 mt-0.5 ${iconClasses[variant]}`}>
          {icons[variant]}
        </div>
        <div>
          {title && (
            <p className={`font-medium text-sm ${textClasses[variant]}`}>
              {title}
            </p>
          )}
          <p className={`text-sm ${bodyTextClasses[variant]}`}>
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
