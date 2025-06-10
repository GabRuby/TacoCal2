// PaymentCalculator.tsx
import React, { useState, useEffect } from 'react';
import { PaymentInput } from './PaymentInput';
import { ChangeDisplay } from './ChangeDisplay';
import { Banknote, CreditCard, QrCode, X } from 'lucide-react';
import { useTables } from '../../../contexts/TablesContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../../../utils/currencyFormatter';
import { Table } from '../../../types';

interface PaymentCalculatorProps {
  total: number;
  tableId: string;
  showIcons?: boolean;
  // Nuevas props para el pago local en subcuentas
  localPayment?: { amount: number; method: Table['payment']['method'] };
  onLocalPaymentChange?: (payment: { amount: number; method: Table['payment']['method'] }) => void;
  isSubaccount?: boolean; // Nueva prop para indicar si es en subcuentas
}

export function PaymentCalculator({ total, tableId, showIcons = false, localPayment, onLocalPaymentChange, isSubaccount = false }: PaymentCalculatorProps) {
  // Usar el pago local si está disponible (para subcuentas), de lo contrario usar el del contexto
  const { tables, updatePayment, closeTable } = useTables();
  const { config } = useConfig();
  const activeTable = tables.find(t => t.id === tableId);
  const contextPayment = activeTable?.payment || { amount: 0, method: 'cash' as const };

  const payment = localPayment !== undefined && onLocalPaymentChange !== undefined ? localPayment : contextPayment;

  // Estado para controlar la visibilidad del modal Mixto
  const [isMixtoModalOpen, setIsMixtoModalOpen] = useState(false);
  // Estado para controlar la visibilidad del modal QR de Transferencia en Mixto
  const [isMixtoTransferQRModalOpen, setIsMixtoTransferQRModalOpen] = useState(false);

  // Estados para los montos del pago mixto
  const [cashAmountMixto, setCashAmountMixto] = useState<number>(0);
  const [transferAmountMixto, setTransferAmountMixto] = useState<number>(0);

  // Calcular total pagado en el modo mixto
  const totalPaidMixto = cashAmountMixto + transferAmountMixto;

  // Calcular restante en el modo mixto
  const remainingMixto = total - totalPaidMixto;

  const handlePaymentMethodChange = (method: Table['payment']['method']) => {
    if (onLocalPaymentChange) {
      onLocalPaymentChange({ ...payment, method });
    } else {
      updatePayment(tableId, { ...payment, method });
    }
  };

  const handlePaymentChange = (amount: number) => {
    if (onLocalPaymentChange) {
      onLocalPaymentChange({ ...payment, amount });
    } else {
      updatePayment(tableId, { ...payment, amount });
    }
  };

  // Determinar el tamaño del icono y el padding basado en showIcons y isSubaccount
  const iconSize = isSubaccount ? 20 : (showIcons ? 24 : 20);
  const buttonPadding = isSubaccount ? 'px-3 py-0.5' : 'px-4 py-2';

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => handlePaymentMethodChange('cash')}
          className={`flex-1 flex items-center justify-center gap-2 ${buttonPadding} rounded-md border ${
            payment.method === 'cash'
              ? 'bg-green-100 border-green-500 text-green-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {showIcons ? (
            <Banknote size={iconSize} />
          ) : (
            <>
              <Banknote size={iconSize} />
              <span>Efectivo</span>
            </>
          )}
        </button>
        <button
          onClick={() => handlePaymentMethodChange('transfer')}
          className={`flex-1 flex items-center justify-center gap-2 ${buttonPadding} rounded-md border ${
            payment.method === 'transfer'
              ? 'bg-blue-100 border-blue-500 text-blue-700'
              : 'bg-white border-gray-300 text-blue-700 hover:bg-blue-50'
          }`}
        >
          {showIcons ? (
            <CreditCard size={iconSize} />
          ) : (
            <>
              <CreditCard size={iconSize} />
              <span>Transferencia</span>
            </>
          )}
        </button>

        {/* Botón Mixto */}
        {!isSubaccount && ( // Solo mostrar el botón mixto en el PaymentCalculator principal
          <button
            onClick={() => setIsMixtoModalOpen(true)}
            className={`flex-1 flex items-center justify-center gap-2 ${buttonPadding} rounded-md border bg-purple-100 border-purple-500 text-purple-700 hover:bg-purple-50`}
          >
             <Banknote size={iconSize} /> {/* Usamos un icono similar por ahora */}
             <span>Mixto</span>
          </button>
        )}
      </div>

      <PaymentInput
        total={total}
        payment={payment.amount}
        onPaymentChange={handlePaymentChange}
        paymentMethod={payment.method}
        isSubaccount={isSubaccount}
      />
      {payment.method === 'cash' && (
        <ChangeDisplay
          payment={payment.amount}
          total={total}
          isSubaccount={isSubaccount}
        />
      )}

      {/* Modal de Proceso de Pago Mixto */}
      {isMixtoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Proceso de Pago Mixto</h3>
              <button
                onClick={() => setIsMixtoModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>
            {/* Aquí iría la lógica compleja para el pago mixto */}
            <div className="space-y-4">
                <div className="flex justify-between text-base font-semibold text-gray-800">
                    <span>Total a pagar:</span>
                    <span>{formatCurrency(total)}</span>
                </div>

                {/* Monto en Transferencia Input */}
                <div>
                     <label className="block text-sm font-medium text-gray-700">Monto en Transferencia:</label>
                     <div className="relative mt-1">
                         <input
                             type="text"
                             inputMode="decimal"
                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-10"
                             placeholder="0.00"
                             value={transferAmountMixto > 0 ? formatCurrency(transferAmountMixto) : ''}
                             onChange={(e) => {
                                 const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                                 const numValue = parseFloat(rawValue) || 0;
                                 setTransferAmountMixto(numValue);
                             }}
                         />
                         {/* Botón QR absoluto */}
                         <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                             <button
                                 onClick={() => setIsMixtoTransferQRModalOpen(true)}
                                 className="text-gray-500 hover:text-gray-700"
                                 title="Mostrar QR de cuenta"
                             >
                                 <QrCode size={20} />
                             </button>
                         </div>
                     </div>
                </div>

                {/* Monto en Efectivo Input */}
                <div>
                     <label className="block text-sm font-medium text-gray-700">Monto en Efectivo:</label>
                     <input
                         type="text"
                         inputMode="decimal"
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                         placeholder="0.00"
                         value={cashAmountMixto > 0 ? formatCurrency(cashAmountMixto) : ''}
                         onChange={(e) => {
                             const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                             const numValue = parseFloat(rawValue) || 0;
                             setCashAmountMixto(numValue);
                         }}
                     />
                </div>

                {/* Mostrar cambio para el pago en efectivo si aplica */}
                {cashAmountMixto > 0 && (total - transferAmountMixto > 0) && (
                    <ChangeDisplay payment={cashAmountMixto} total={total - transferAmountMixto} isSubaccount={true} />
                )}

                 {/* Aquí se mostraría el total pagado y el restante */}
                  <div className="flex justify-between text-base font-semibold text-gray-800 mt-4 border-t pt-4">
                    <span>Total Pagado:</span>
                    <span>{formatCurrency(totalPaidMixto)}</span>
                </div>
                 <div className="flex justify-between text-base font-semibold text-gray-800">
                    <span>Restante:</span>
                    <span className={remainingMixto > 0 ? 'text-red-500' : 'text-green-500'}>{formatCurrency(Math.abs(remainingMixto))}</span>
                </div>

                <button
                    onClick={() => {
                        if (totalPaidMixto >= total) {
                            updatePayment(tableId, { amount: totalPaidMixto, method: 'mixed', cashPart: cashAmountMixto, transferPart: transferAmountMixto });
                            setIsMixtoModalOpen(false);
                        } else {
                            alert('El monto pagado es insuficiente.');
                        }
                    }}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    disabled={totalPaidMixto < total}
                >
                    Confirmar Pago Mixto
                </button>

            </div>
          </div>
        </div>
      )}

      {/* Modal del QR de Transferencia (puede estar fuera del modal mixto si es global) */}
      {isMixtoTransferQRModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Código QR para Transferencia</h3>
              <button
                onClick={() => setIsMixtoTransferQRModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              {config.accountNumber ? (
                <>
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <QRCodeSVG
                      value={config.accountNumber}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Escanea este código QR para obtener el número de cuenta
                  </p>
                </>
              ) : (
                <p className="text-red-500 text-center">
                  No hay número de cuenta configurado. Por favor, configura el número de cuenta en la configuración del negocio.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 