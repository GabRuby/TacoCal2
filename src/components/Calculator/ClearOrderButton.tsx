import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ClearOrderButtonProps {
  onClick: () => void;
  isEnabled: boolean;
}

export function ClearOrderButton({ onClick, isEnabled }: ClearOrderButtonProps) {
  const handleClick = () => {
    if (isEnabled && confirm('¿Estás seguro de cancelar la orden?')) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isEnabled}
      className={`
        flex-1 flex items-center justify-center gap-1 
        py-2 px-4 rounded-lg transition-colors text-sm sm:text-base
        ${isEnabled 
          ? 'bg-red-600 hover:bg-red-700 text-white' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
      `}
      title={isEnabled ? 'Cancelar orden' : 'No hay productos para cancelar'}
    >
      <RefreshCw size={18} />
      Cancelar Orden
    </button>
  );
}