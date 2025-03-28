import React from 'react';

const FormError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
      {message}
    </div>
  );
};

export default FormError; 