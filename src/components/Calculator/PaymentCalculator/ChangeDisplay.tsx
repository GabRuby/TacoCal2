import React from 'react';

interface ChangeDisplayProps {
  payment: number;
  total: number;
  isSubaccount?: boolean;
}

export function ChangeDisplay({ payment, total, isSubaccount = false }: ChangeDisplayProps) {
  const change = payment - total;
  const isValidPayment = payment >= total;

  if (!payment) return null;

  // Determinar el padding vertical y el margen superior basado en isSubaccount
  const verticalPadding = isSubaccount ? 'py-1.5' : 'py-3';
  const marginTop = isSubaccount ? 'mt-0' : '';

  return (
    <div className={`${verticalPadding} px-3 rounded-lg ${isValidPayment ? 'bg-green-50' : 'bg-red-50'} ${marginTop}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {isSubaccount ? (isValidPayment ? '+ ' : '- ') : (isValidPayment ? 'Cambio a entregar:' : 'Falta por pagar:')}
        </span>
        <span className={`text-lg font-bold ${isValidPayment ? 'text-green-600' : 'text-red-600'}`}>
          ${Math.abs(change).toFixed(2)}
        </span>
      </div>
    </div>
  );
}