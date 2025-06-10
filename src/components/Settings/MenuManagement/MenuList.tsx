import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { MenuItem } from '../../../types';
import { CATEGORIES } from '../../../data/menuItems';

interface MenuListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export function MenuList({ items, onEdit, onDelete }: MenuListProps) {
  const categoryLabels: Record<string, string> = {
    [CATEGORIES.MAIN]: 'Alimentos',
    [CATEGORIES.DRINKS]: 'Bebidas',
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      onDelete(id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay productos en el menú.</p>
        <p className="text-sm">Haz clic en "Agregar Producto" para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <div>
            <h4 className="font-medium text-gray-800">{item.name}</h4>
            <div className="flex gap-2 text-sm text-gray-600">
              <span>{categoryLabels[item.category]}</span>
              <span>•</span>
              <span>
                {item.isPesos ? '$1.00 por peso' : `$${item.price.toFixed(2)}`}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-orange-600 hover:bg-orange-200 rounded-md transition-colors"
              title="Editar producto"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => handleDelete(item.id, item.name)}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
              title="Eliminar producto"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}