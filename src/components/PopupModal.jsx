import React from 'react';
import { X } from 'lucide-react';

const PopupModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-white/30 backdrop-blur-sm">
      {/* 
        Mobile: slides up from bottom (items-end), full width, rounded top corners
        Desktop (sm+): centered with max-w-lg
      */}
      <div className="bg-white/95 backdrop-blur-md w-full sm:rounded-lg sm:max-w-lg sm:mx-4 rounded-t-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 flex flex-col animate-fade-in max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
