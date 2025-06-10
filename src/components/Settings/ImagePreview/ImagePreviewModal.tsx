import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImagePreviewModal({ isOpen, onClose, imageUrl }: ImagePreviewModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="relative max-w-3xl max-h-[85vh] w-full">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
          title="Close preview"
        >
          <X size={20} />
        </button>

        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
}