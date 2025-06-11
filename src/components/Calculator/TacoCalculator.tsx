//TacoCalculator.tsx
import React, { useState } from 'react';
import { MenuItems } from './MenuItems/MenuItems';
import { OrderSummary } from './OrderSummary';
import { SaveOrderButton } from './SaveOrderButton';
import { ClearOrderButton } from './ClearOrderButton';
import { useCalculateTotal } from '../../utils/calculations';
import { UtensilsCrossed, Settings, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { SettingsModal } from '../Settings/SettingsModal';
import { getConfig } from '../../utils/config';
import { useTables } from '../../contexts/TablesContext';
import { ImagePreviewModal } from '../Settings/ImagePreview/ImagePreviewModal';
import { hasValidOrder } from '../../utils/order';
import { addSaleToDaily } from '../../utils/dailySales';
import { menuItems } from '../../data/menuItems';
import { useDailySales } from '../../contexts/DailySalesContext';

export function TacoCalculator() {
  const [showSettings, setShowSettings] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [isToGo, setIsToGo] = useState(false);
  const [toGoCharge, setToGoCharge] = useState<number>(0);
  const [config, setConfig] = useState(getConfig());
  const calculateTotal = useCalculateTotal();
  const { tables, activeTableId, closeTable, updateOrder, updateTableInfo } = useTables();
  const { refreshDailySales } = useDailySales();

  const activeTable = tables.find(t => t.id === activeTableId);
  const currentOrder = activeTable?.currentOrder || [];
  const total = calculateTotal(currentOrder);
  const isOrderValid = hasValidOrder(currentOrder);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (!activeTableId) return;
    
    const newOrder = quantity === 0
      ? currentOrder.filter(item => item.id !== id)
      : currentOrder.some(item => item.id === id)
        ? currentOrder.map(item => item.id === id ? { ...item, quantity } : item)
        : [...currentOrder, { id, quantity }];

    updateOrder(activeTableId, newOrder);
  };

  const handleSave = () => {
    if (!isOrderValid || !activeTableId || !activeTable) return;
    
    const sale = {
      items: currentOrder,
      total: total + (isToGo ? toGoCharge : 0),
      timestamp: new Date().toISOString(),
      tableNumber: activeTable.number,
      paymentMethod: activeTable.payment?.method || 'cash',
      ...(activeTable.payment?.cashPart !== undefined && { cashPart: activeTable.payment.cashPart }),
      ...(activeTable.payment?.transferPart !== undefined && { transferPart: activeTable.payment.transferPart }),
      ...(activeTable.payment?.cardPart !== undefined && { cardPart: activeTable.payment.cardPart }),
      ...(isToGo && { toGoCharge: toGoCharge }),
    };
    
    const tableNameAtSale = activeTable.name ?? `Mesa ${activeTable.number}`;

    addSaleToDaily(sale, activeTable.id, tableNameAtSale);
    closeTable(activeTableId);
    refreshDailySales();
  };

  const handleClearOrder = () => {
    if (!activeTableId) return;
    updateOrder(activeTableId, []);
    setIsToGo(false);
    setToGoCharge(0);
  };

  const handleOrderComplete = () => {
    if (!activeTableId) return;
    closeTable(activeTableId);
    setIsToGo(false);
    setToGoCharge(0);
  };

  if (!activeTableId) {
    return (
      <div className="flex items-center justify-center p-8 bg-orange-50 rounded-lg">
        <div className="text-center space-y-2">
          <UtensilsCrossed className="mx-auto text-orange-600" size={32} />
          <p className="text-gray-600">Selecciona una mesa para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {activeTable?.name ?? `Mesa ${activeTable?.number}`}
        </h2>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isToGo"
            checked={isToGo}
            onChange={(e) => {
              setIsToGo(e.target.checked);
              if (!e.target.checked) {
                setToGoCharge(0);
              }
            }}
            className="rounded text-orange-600 focus:ring-orange-300"
          />
          <label htmlFor="isToGo" className="text-sm text-gray-700">
            Para llevar
          </label>
        </div>
        {isToGo && (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              value={toGoCharge === 0 ? '' : toGoCharge}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setToGoCharge(Math.max(1, value));
              }}
              onWheel={(e) => e.preventDefault()}
              className="w-32 pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="1.00"
            />
          </div>
        )}
      </div>

      <button
        onClick={() => setShowCustomerInfo(!showCustomerInfo)}
        className={`w-full flex justify-end items-center px-4 py-2 bg-orange-50 rounded-lg ${showCustomerInfo ? '' : 'mb-4'} ${
          (activeTable?.customerName || activeTable?.observations) ? 'text-green-600' : 'text-gray-600'
        }`}
        title="Información del Cliente"
      >
        {showCustomerInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {showCustomerInfo && (
      <div className="bg-orange-50 p-4 rounded-lg space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-1">
              <User size={16} />
              Nombre del Cliente
            </div>
          </label>
          <input
            type="text"
            value={activeTable?.customerName || ''}
            onChange={(e) => updateTableInfo(activeTableId, { customerName: e.target.value })}
            placeholder="Ingresa el nombre del cliente"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-1">
              <FileText size={16} />
              Observaciones
            </div>
          </label>
          <textarea
            value={activeTable?.observations || ''}
            onChange={(e) => updateTableInfo(activeTableId, { observations: e.target.value })}
            placeholder="Agrega notas o especificaciones del pedido"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 h-20"
          />
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <MenuItems
            order={currentOrder}
            onUpdateQuantity={handleQuantityChange}
          />
        </div>
        <div>
          <OrderSummary 
            order={currentOrder} 
            total={total}
            tableNumber={activeTable?.number ?? 0}
            tableId={activeTableId ?? ''}
            onOrderComplete={handleOrderComplete}
            isToGo={isToGo}
            toGoCharge={toGoCharge}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <ClearOrderButton
          onClick={handleClearOrder}
          isEnabled={isOrderValid}
        />
        <SaveOrderButton
          onClick={handleSave}
          isEnabled={isOrderValid}
        />
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentConfig={config}
        onConfigUpdate={setConfig}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={config.imageUrl}
      />
    </div>
  );
}