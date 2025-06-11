import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onUpdate: (value: number) => void;
}

export function QuantityControl({ quantity, onUpdate }: QuantityControlProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdate(quantity - 1);
        }}
        className="p-1.5 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition-colors disabled:opacity-50"
        disabled={quantity === 0}
      >
        <Minus size={16} />
      </button>
      
      <input
        type="text"
        min="0"
        value={quantity}
        onChange={(e) => {
          e.stopPropagation();
          onUpdate(parseInt(e.target.value) || 0);
        }}
        onWheel={(e) => e.preventDefault()}
        className="w-14 text-center font-medium bg-white border border-orange-200 rounded-md py-0.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdate(quantity + 1);
        }}
        className="p-1.5 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}