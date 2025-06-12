// OrderSummary.tsx
import React, { useState, useEffect } from 'react';
import { menuItems } from '../../data/menuItems';
import { TacoOrder } from '../../types';
import { PaymentCalculator } from './PaymentCalculator/PaymentCalculator';
import SplitBillContainer from './SplitBillContainer';
import { Split, X, Minus, Plus, QrCode } from 'lucide-react';
import { addSaleToDaily } from '../../utils/dailySales';
import { useTables } from '../../contexts/TablesContext';
import { QRCodeSVG } from 'qrcode.react'; // Importar QRCodeSVG
import { formatCurrency } from '../../utils/currencyFormatter'; // Importar formatCurrency

interface OrderSummaryProps {
  order: TacoOrder[];
  total: number;
  tableNumber: number;
  tableId: string;
  onOrderComplete?: () => void;
  isToGo: boolean;
  toGoCharge: number;
}

export function OrderSummary({ 
  order, 
  total, 
  tableNumber, 
  tableId,
  onOrderComplete,
  isToGo,
  toGoCharge
}: OrderSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFontSizeIndex, setCurrentFontSizeIndex] = useState(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const FONT_SIZES = ['text-sm', 'text-base', 'text-lg'];
  const BASE_FONT_INDEX = 0;

  const { tables } = useTables();
  const activeTable = tables.find(t => t.id === tableId);
  const payment = activeTable?.payment || { amount: 0, method: 'cash' as const };

  const finalTotal = total + (isToGo ? toGoCharge : 0);

  if (order.length === 0) {
    return (
      <div className="bg-orange-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tu Orden</h2>
        <p className="text-gray-600 text-sm">Agrega algunos productos para comenzar</p>
      </div>
    );
  }

  const handleIncreaseFont = () => {
    setCurrentFontSizeIndex(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
  };

  const handleDecreaseFont = () => {
    setCurrentFontSizeIndex(prev => Math.max(prev - 1, BASE_FONT_INDEX));
  };

  const generateQrText = () => {
    let qrText = "Tu Orden:\n\n";
    order.forEach(item => {
      const menuItem = menuItems.find(m => m.id === item.id);
      if (menuItem) {
        qrText += `${menuItem.name} x ${item.quantity} = ${formatCurrency(menuItem.price * item.quantity)}\n`;
      }
    });
    if (isToGo && toGoCharge > 0) {
      qrText += `\nPara llevar: ${formatCurrency(toGoCharge)}\n`;
    }
    qrText += `\n\nTotal: ${formatCurrency(finalTotal)}`;
    return qrText;
  };

  const handleOpenQrModal = () => {
    setIsQrModalOpen(true);
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
  };

  const handleTotalPaidAmountChange = (amount: number) => {
    // Implement the logic to update the payment amount
  };

  const handlePaymentMethodChange = (method: 'cash' | 'transfer') => {
    // Implement the logic to update the payment method
  };

  return (
    <div className="bg-orange-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-2">
      <h2 className="text-xl font-bold text-gray-800">Tu Orden</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDecreaseFont}
            className="p-1.5 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition-colors disabled:opacity-50"
            disabled={currentFontSizeIndex === BASE_FONT_INDEX}
          >
            <Minus size={16} />
          </button>
          <button
            onClick={handleIncreaseFont}
            className="p-1.5 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={handleOpenQrModal}
            className="p-1.5 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition-colors"
            aria-label="Generar Código QR"
          >
            <QrCode size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {order.map((item) => {
          const menuItem = menuItems.find((m) => m.id === item.id);
          const subtotal = menuItem ? menuItem.price * item.quantity : 0;
          
          return (
            <div key={item.id} className={`flex justify-between text-gray-700 ${FONT_SIZES[currentFontSizeIndex]}`}>
              <span>{menuItem?.name} x {Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          );
        })}
        
        {isToGo && toGoCharge > 0 && (
          <div className={`flex justify-between text-gray-700 ${FONT_SIZES[currentFontSizeIndex]}`}>
            <span>Para llevar</span>
            <span>{formatCurrency(toGoCharge)}</span>
          </div>
        )}
        
        <div className="border-t border-orange-200 pt-2 mt-2">
          <div className={`flex justify-between font-bold ${FONT_SIZES[currentFontSizeIndex]}`}>
            <span>Total</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Split className="w-4 h-4" />
            Dividir Cuenta
          </button>
        </div>
      </div>

      {/* Sección de pago - Solo informativa */}
      <div className="mt-4 pt-4 border-t border-orange-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Calculadora de Cambio</h3>
        <PaymentCalculator 
          total={finalTotal}
          tableId={tableId}
        />
      </div>

      {/* Reemplazamos el modal anterior por el nuevo contenedor */}
      {isModalOpen && (
        <SplitBillContainer
          order={order}
          total={finalTotal}
          tableId={tableId}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Modal para el Código QR */}
      {isQrModalOpen && ( 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full relative">
            <button
              onClick={handleCloseQrModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Código QR de la Orden</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={generateQrText()} size={256} level="H" />
            </div>
            <p className="text-center text-gray-600 text-sm">Escanea para ver la lista de productos y el total.</p>
          </div>
        </div>
      )}
    </div>
  );
}