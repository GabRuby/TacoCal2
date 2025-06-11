import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { menuItems } from '../../data/menuItems';
import { TacoOrder } from '../../types';

interface MenuItemsProps {
  order: TacoOrder[];
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function MenuItems({ order, onUpdateQuantity }: MenuItemsProps) {
  const getQuantity = (id: string) => {
    return order.find(item => item.id === id)?.quantity || 0;
  };

  const handleInputChange = (id: string, value: string) => {
    const quantity = parseInt(value) || 0;
    if (quantity >= 0) {
      onUpdateQuantity(id, quantity);
    }
  };

  const renderInput = (item: typeof menuItems[0]) => {
    if (item.id === 'carne-pesos') {
      return (
        <input
          type="text"
          min="0"
          step="1"
          value={getQuantity(item.id)}
          onChange={(e) => handleInputChange(item.id, e.target.value)}
          onWheel={(e) => e.preventDefault()}
          className="w-20 text-center font-medium bg-white border border-orange-200 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="$0"
        />
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.id, getQuantity(item.id) - 1)}
          className="p-1.5 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition-colors disabled:opacity-50"
          disabled={getQuantity(item.id) === 0}
        >
          <Minus size={16} />
        </button>
        
        <input
          type="text"
          min="0"
          value={getQuantity(item.id)}
          onChange={(e) => handleInputChange(item.id, e.target.value)}
          onWheel={(e) => e.preventDefault()}
          className="w-14 text-center font-medium bg-white border border-orange-200 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        
        <button
          onClick={() => onUpdateQuantity(item.id, getQuantity(item.id) + 1)}
          className="p-1.5 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-800">Menú</h2>
      <div className="grid gap-2">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center justify-between flex-1 mr-4">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <span className="text-orange-600 font-medium">
                {item.id === 'carne-pesos' ? '$1.00 por peso' : `$${item.price.toFixed(2)}`}
              </span>
            </div>
            
            {renderInput(item)}
          </div>
        ))}
      </div>
    </div>
  );
} 