//DailySalesReport.tsx
import React from 'react';
import { getDailySalesReport } from '../../utils/dailySales';
import { formatTime, formatDate } from '../../utils/date';
import { formatQuantity } from '../../utils/numberFormat';
import { useMenu } from '../../contexts/MenuContext';

const getShortPaymentMethod = (method: string | undefined): string => {
  switch (method) {
    case 'cash': return 'Efec';
    case 'transfer': return 'Transf';
    case 'card': return 'Tarj';
    case 'mixed': return 'Mixto';
    default: return 'NoEsp';
  }
};

export function DailySalesReport() {
  const dailySales = getDailySalesReport();
  const { menuItems } = useMenu();

  // Calcular totales por método de pago
  const totalsByMethod = dailySales.sales.reduce((acc, sale) => {
    const method = sale.paymentMethod || 'NoEsp'; // Usar 'NoEsp' si no hay método definido
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += sale.total;
    return acc;
  }, {} as Record<string, number>); // Especificar tipo para el acumulador

  if (dailySales.sales.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay ventas registradas hoy</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Ventas del Día {formatDate(dailySales.date)}
        </h2>
        <p className="text-lg font-semibold text-orange-600">
          Total: ${dailySales.total.toFixed(2)}
        </p>
      </div>

      {/* Nueva sección de resumen por método de pago */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumen por Método de Pago</h3>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          {/* Columna Efectivo */}
          <div className="flex-1 text-center border-r border-gray-200">
            <p>Efectivo</p>
            <p>${(totalsByMethod['cash'] || 0).toFixed(2)}</p>
          </div>
          {/* Columna Transferencia */}
          <div className="flex-1 text-center border-r border-gray-200">
            <p>Transf</p>
            <p>${(totalsByMethod['transfer'] || 0).toFixed(2)}</p>
          </div>
          {/* Columna Mixto */}
          <div className="flex-1 text-center"> {/* La última columna no necesita borde derecho */}
            <p>Mixto</p>
            <p>${(totalsByMethod['mixed'] || 0).toFixed(2)}</p>
          </div>
           {/* Podrías añadir 'NoEsp' si quieres, pero generalmente no es necesario en el resumen */}
          {/* {totalsByMethod['NoEsp'] && (
             <div className="flex-1 text-center">
               <p>No Esp.</p>
               <p>${totalsByMethod['NoEsp'].toFixed(2)}</p>
             </div>
           )} */}
        </div>
      </div>

      <div className="space-y-3">
        {dailySales.sales.map((sale) => (
          <div key={sale.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">Mesa {sale.tableNumber}</h3>
                <p className="text-sm text-gray-500">
                  {formatTime(sale.timestamp)}
                </p>
                <p className="text-sm text-gray-500">
                  {getShortPaymentMethod(sale.paymentMethod)}
                </p>
              </div>
              <span className="font-semibold text-orange-600">
                ${sale.total.toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-1">
              {sale.items.map((item) => {
                const menuItem = menuItems.find(m => m.id === item.id);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {menuItem?.name} x {formatQuantity(item.quantity)}
                    </span>
                    <span className="text-gray-700">
                      ${((menuItem?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}