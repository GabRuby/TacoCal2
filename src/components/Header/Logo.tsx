import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface LogoProps {
  imageUrl?: string;
  name: string;
}

export function Logo({ imageUrl, name }: LogoProps) {
  return (
    <div className="flex items-center gap-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-20 h-20 object-contain rounded-lg" // Increased from w-12 h-12
        />
      ) : (
        <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center"> {/* Increased from w-12 h-12 */}
          <UtensilsCrossed className="text-orange-600" size={40} /> {/* Increased from size={24} */}
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-800">{name}</h1> {/* Increased from text-2xl */}
    </div>
  );
}