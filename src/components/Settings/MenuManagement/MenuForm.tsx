import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { CATEGORIES } from '../../../data/menuItems';
import { MenuItem } from '../../../types';

interface MenuFormProps {
  item?: Partial<MenuItem>;
  onSubmit: (item: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
}

export function MenuForm({ item = {}, onSubmit, onCancel }: MenuFormProps) {
  const [formData, setFormData] = useState({
    name: item.name || '',
    price: item.price || 0,
    category: item.category || CATEGORIES.MAIN,
    isPesos: item.isPesos || false,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    if (formData.price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 p-4 rounded-lg space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Producto *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Ej: Taco de Barbacoa"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precio *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={formData.price || ''}
            onChange={e => {
              const value = e.target.value.replace(/[^0-9.]/g, '');
              // Validar que solo haya un punto decimal
              const parts = value.split('.');
              if (parts.length > 2) return;
              // Validar que después del punto decimal solo haya 2 dígitos
              if (parts[1] && parts[1].length > 2) return;
              const numValue = parseFloat(value) || 0;
              setFormData({ ...formData, price: numValue });
            }}
            className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Ingresa el precio con hasta 2 decimales (ej: 28.50)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría *
        </label>
        <select
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value={CATEGORIES.MAIN}>Alimentos</option>
          <option value={CATEGORIES.DRINKS}>Bebidas</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPesos"
          checked={formData.isPesos}
          onChange={e => setFormData({ ...formData, isPesos: e.target.checked })}
          className="rounded text-orange-600 focus:ring-orange-300"
        />
        <label htmlFor="isPesos" className="text-sm text-gray-700">
          Venta por peso
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
        >
          <Save size={16} />
          Guardar
        </button>
      </div>
    </form>
  );
}