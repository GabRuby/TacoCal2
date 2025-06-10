import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { MenuItem } from '../../types';
import { CATEGORIES } from '../../data/menuItems';

interface MenuManagementProps {
  items: MenuItem[];
  onItemsChange: (items: MenuItem[]) => void;
}

interface MenuItemFormData {
  id: string;
  name: string;
  price: number;
  category: string;
  isPesos?: boolean;
  unit?: string;
}

const defaultItemForm: MenuItemFormData = {
  id: '',
  name: '',
  price: 0,
  category: CATEGORIES.MAIN,
  isPesos: false,
  unit: 'g',
};

const UNITS = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'oz', label: 'Onzas (oz)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'cup', label: 'Tazas (cup)' },
  { value: 'fl.oz', label: 'Onzas líquidas (fl.oz)' },
];

export function MenuManagement({ items, onItemsChange }: MenuManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemFormData>(defaultItemForm);
  const [error, setError] = useState('');
  const [isOrderingMode, setIsOrderingMode] = useState(false);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditing(true);
    setError('');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      onItemsChange(items.filter(item => item.id !== id));
    }
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onItemsChange(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!editingItem.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!editingItem.price || editingItem.price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    const price = parseFloat(editingItem.price.toString());
    if (isNaN(price) || price <= 0) {
      setError('El precio debe ser un número válido mayor a 0');
      return;
    }

    const newItems = editingItem.id
      ? items.map(item => (item.id === editingItem.id ? { ...editingItem, price } : item))
      : [...items, { ...editingItem, id: crypto.randomUUID(), price }];

    onItemsChange(newItems);
    setIsEditing(false);
    setEditingItem(defaultItemForm);
  };

  const categoryLabels: Record<string, string> = {
    [CATEGORIES.MAIN]: 'Platillos',
    [CATEGORIES.DRINKS]: 'Bebidas'
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-orange-100 px-4 py-3 flex-shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-medium text-gray-700">Productos del Menú</h4>
          <button
            onClick={() => setIsOrderingMode(!isOrderingMode)}
            className={`p-1.5 rounded-md transition-colors ${
              isOrderingMode 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={isOrderingMode ? 'Desactivar ordenamiento' : 'Activar ordenamiento'}
          >
            <ArrowUpDown size={18} />
          </button>
        </div>
        <button
          onClick={() => {
            setEditingItem(defaultItemForm);
            setIsEditing(true);
            setError('');
          }}
          className="flex items-center gap-1 text-sm bg-orange-600 text-white px-3 py-1.5 rounded-md hover:bg-orange-700 flex-shrink-0"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-orange-50 p-4 rounded-lg space-y-3 overflow-y-auto flex-shrink-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingItem.name}
              onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                error && !editingItem.name.trim() ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Taco de Barbacoa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={editingItem.price === 0 ? '' : editingItem.price}
                onChange={e => {
                  const value = e.target.value;
                  setEditingItem({ ...editingItem, price: value as any });
                }}
                onBlur={e => {
                  const numValue = parseFloat(e.target.value);
                  if (!isNaN(numValue) && numValue >= 0) {
                    setEditingItem({ ...editingItem, price: numValue });
                  } else {
                    setEditingItem({ ...editingItem, price: 0 });
                  }
                }}
                className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  error && (!editingItem.price || editingItem.price <= 0) ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
              />
              {editingItem.isPesos && (
                <select
                  value={editingItem.unit || 'g'}
                  onChange={e => setEditingItem({ ...editingItem, unit: e.target.value })}
                  className="ml-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-700"
                >
                  {UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Ingresa el precio con hasta 2 decimales (ej: 28.50)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={editingItem.category}
              onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPesos"
              checked={editingItem.isPesos || false}
              onChange={e => {
                setEditingItem({ ...editingItem, isPesos: e.target.checked });
                if (!e.target.checked) {
                  setEditingItem(prev => ({ ...prev, unit: undefined }));
                }
              }}
              className="rounded text-orange-600 focus:ring-orange-300"
            />
            <label htmlFor="isPesos" className="text-sm text-gray-700">
              Venta por peso
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingItem(defaultItemForm);
                setError('');
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
            >
              <Save size={16} />
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto grid gap-2 p-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              {isOrderingMode && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveItem(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded-md transition-colors ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-orange-200'
                    }`}
                    title="Mover arriba"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className={`p-1 rounded-md transition-colors ${
                      index === items.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-orange-200'
                    }`}
                    title="Mover abajo"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
              <div className="flex-1">
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
                  onClick={() => handleEdit(item)}
                  className="p-1.5 text-orange-600 hover:bg-orange-200 rounded-md"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}