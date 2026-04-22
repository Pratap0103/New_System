import React from 'react';
import { X } from 'lucide-react';

const ImageViewer = ({ isOpen, onClose, imageUrl, altText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={onClose}>
      <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <X size={28} />
        </button>
        <img 
          src={imageUrl || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop'} 
          alt={altText || 'Attached Image'} 
          className="w-full h-auto rounded-lg shadow-2xl"
        />
        <div className="bg-white p-4 mt-2 rounded-lg text-sm text-center">
          Simulation Image for Order Attachment
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
