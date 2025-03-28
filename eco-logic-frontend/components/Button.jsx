import React from 'react';

const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  variant = 'primary',
  className = '',
}) => {
  const baseClasses = 'py-3 px-4 rounded-lg transition-colors duration-200 font-medium disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400',
    secondary: 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/30',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 