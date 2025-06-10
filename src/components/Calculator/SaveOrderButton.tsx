import React from 'react';
import { Save } from 'lucide-react';

interface SaveOrderButtonProps {
  onClick: () => void;
  isEnabled: boolean;
}

export function SaveOrderButton({ onClick, isEnabled }: SaveOrderButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isEnabled}
      className={`
        basis-1/2 flex items-center justify-center gap-1 
        py-2 px-4 rounded-lg transition-colors text-sm sm:text-base
        ${isEnabled 
          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
      `}
      title={isEnabled ? 'Guardar orden' : 'Agrega productos para guardar'}
    >
      <Save size={18} />
      Guardar
    </button>
  );
}