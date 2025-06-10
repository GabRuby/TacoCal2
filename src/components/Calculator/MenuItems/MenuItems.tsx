import React, { useState } from 'react';
import { MenuItem } from './MenuItem';
import { TacoOrder } from '../../../types';
import { useMenu } from '../../../contexts/MenuContext';

interface MenuItemsProps {
  order: TacoOrder[];
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function MenuItems({ order, onUpdateQuantity }: MenuItemsProps) {
  const { menuItems } = useMenu();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const getQuantity = (id: string) => {
    return order.find(item => item.id === id)?.quantity || 0;
  };

  const handleMenuItemClick = (id: string) => {
    setSelectedItemId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-gray-800">Menú</h2>
      <div className="grid gap-1.5">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            quantity={getQuantity(item.id)}
            onUpdateQuantity={onUpdateQuantity}
            isSelected={selectedItemId === item.id}
            onSelect={handleMenuItemClick}
          />
        ))}
      </div>
    </div>
  );
}