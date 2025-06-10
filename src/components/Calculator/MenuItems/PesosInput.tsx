import React, { useState, useEffect } from 'react';
import { MenuItem as MenuItemType } from '../../../types';
import { formatCurrency } from '../../../utils/currencyFormatter';

interface PesosInputProps {
  item: MenuItemType;
  value: number;
  onChange: (value: number) => void;
}

export function PesosInput({ item, value, onChange }: PesosInputProps) {
  const [amountInPesos, setAmountInPesos] = useState<string>('');
  const [amountInUnits, setAmountInUnits] = useState<string>('');
  const [activeInput, setActiveInput] = useState<'pesos' | 'units' | null>(null);

  const pricePerUnit = item.price;
  const unitLabel = item.unit || 'unidad';

  useEffect(() => {
    if (activeInput === null) {
      if (value === 0) {
        setAmountInUnits('');
        setAmountInPesos('');
      } else {
        const units = value;
        const pesos = value * pricePerUnit;
        setAmountInUnits(units.toFixed(3));
        setAmountInPesos(pesos.toFixed(2));
      }
    }
  }, [value, pricePerUnit, activeInput]);

  const handlePesosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setActiveInput('pesos');
    const rawValue = e.target.value;
    setAmountInPesos(rawValue);

    const newPesos = Math.max(0, parseFloat(rawValue) || 0);
    const newUnits = pricePerUnit > 0 ? newPesos / pricePerUnit : 0;
    setAmountInUnits(newUnits.toFixed(3));
    onChange(newUnits);
  };

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setActiveInput('units');
    const rawValue = e.target.value;
    setAmountInUnits(rawValue);

    const newUnits = Math.max(0, parseFloat(rawValue) || 0);
    const newPesos = newUnits * pricePerUnit;
    setAmountInPesos(newPesos.toFixed(2));
    onChange(newUnits);
  };

  const handleBlur = () => {
    const units = Math.max(0, parseFloat(amountInUnits) || 0);
    const pesos = Math.max(0, parseFloat(amountInPesos) || 0);

    setAmountInUnits(units === 0 ? '' : units.toFixed(3));
    setAmountInPesos(pesos === 0 ? '' : pesos.toFixed(2));
    setActiveInput(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center space-x-1 w-48 text-right">
      <div className="relative flex-1">
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={activeInput === 'pesos' ? amountInPesos : (parseFloat(amountInPesos) === 0 ? '' : formatCurrency(parseFloat(amountInPesos), 'MXN', 'es-MX').replace('$', ''))}
          onChange={handlePesosChange}
          onFocus={() => setActiveInput('pesos')}
          onBlur={handleBlur}
          onWheel={handleWheel}
          className={`w-full pl-4 pr-0.5 py-1 border rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${activeInput === 'units' ? 'text-gray-500 bg-gray-100' : 'text-gray-800 bg-white'}
          `}
          placeholder={formatCurrency(0, 'MXN', 'es-MX').replace('$', '')}
        />
      </div>
      <span className="text-gray-500">/</span>
      <div className="relative flex-1">
    <input
      type="number"
          inputMode="decimal"
      min="0"
          value={activeInput === 'units' ? amountInUnits : (parseFloat(amountInUnits) === 0 ? '' : parseFloat(amountInUnits).toFixed(3))}
          onChange={handleUnitsChange}
          onFocus={() => setActiveInput('units')}
          onBlur={handleBlur}
          onWheel={handleWheel}
          className={`w-full pl-0.5 pr-6 py-1 border rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${activeInput === 'pesos' ? 'text-gray-500 bg-gray-100' : 'text-gray-800 bg-white'}
          `}
          placeholder="0.000"
    />
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{unitLabel}</span>
      </div>
    </div>
  );
}