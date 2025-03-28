import React from 'react';

const Modal = ({ isOpen, onClose, children, title, subtitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg 
                hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors z-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-600 dark:text-gray-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>}
              {subtitle && <p className="text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 