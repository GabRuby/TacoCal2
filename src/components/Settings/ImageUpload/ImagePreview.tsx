import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  alt?: string;
}

export function ImagePreview({ imageUrl, onRemove, alt = 'Preview' }: ImagePreviewProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover rounded-lg shadow-md"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-sm transition-colors"
        aria-label="Remove image"
      >
        <X size={16} />
      </button>
    </div>
  );
}