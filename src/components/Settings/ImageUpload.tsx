import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  imageUrl: string;
  onImageChange: (base64: string) => void;
  onImageRemove: () => void;
  aspectRatio?: string;
}

export function ImageUpload({ imageUrl, onImageChange, onImageRemove, aspectRatio = '1/1' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor selecciona una imagen en formato JPG, PNG o GIF');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      onImageChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {imageUrl && (
        <div className="relative w-full max-w-md mx-auto" style={{ aspectRatio }}>
          <div className="w-full h-full overflow-hidden rounded-lg shadow-md">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept=".jpg,.jpeg,.png,.gif"
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-md mx-auto flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-orange-200 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
      >
        <Upload size={20} />
        <span className="text-sm font-medium">
          {imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </span>
      </button>
    </div>
  );
}