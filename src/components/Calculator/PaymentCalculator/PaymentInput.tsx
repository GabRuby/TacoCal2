import React, { useState } from 'react';
import { CreditCard, QrCode, X } from 'lucide-react';
import { useConfig } from '../../../contexts/ConfigContext';
import { QRCodeSVG } from 'qrcode.react';
import { Table } from '../../../types';

interface PaymentInputProps {
  total: number;
  payment: number;
  onPaymentChange: (amount: number) => void;
  paymentMethod: Table['payment']['method'];
  isSubaccount?: boolean;
}

export function PaymentInput({ total, payment, onPaymentChange, paymentMethod, isSubaccount = false }: PaymentInputProps) {
  const { config } = useConfig();
  const [showQR, setShowQR] = useState(false);

  const inputPaddingVertical = isSubaccount ? 'py-1' : 'py-2';

  return (
    <div>
      <div className={isSubaccount ? 'mb-0' : 'mb-3'}>
        <label className="block text-sm font-medium text-gray-700">
          {paymentMethod === 'cash' ? 'Pago del Cliente' : 'Monto de la Transferencia'}
        </label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={payment || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '');
              const numValue = parseFloat(value) || 0;
              onPaymentChange(numValue);
            }}
            className={`w-full pl-7 pr-24 ${inputPaddingVertical} border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            placeholder="0.00"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-2">
            {paymentMethod === 'transfer' && (
              <button
                onClick={() => setShowQR(true)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Mostrar QR de pago"
              >
                <QrCode className="text-gray-400" size={20} />
              </button>
            )}
            {paymentMethod === 'cash' ? (
              <CreditCard className="mr-3 text-gray-400" size={20} />
            ) : (
              <CreditCard className="mr-3 text-blue-500" size={20} />
            )}
          </div>
        </div>
      </div>

      {/* Modal del QR */}
      {showQR && paymentMethod === 'transfer' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Código QR para Transferencia</h3>
              <button
                onClick={() => setShowQR(false)}
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