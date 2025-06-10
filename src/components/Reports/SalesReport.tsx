import React from 'react';
import { getDailySalesReport } from '../../utils/dailySales';
import { formatTime } from '../../utils/date';
import { useMenu } from '../../contexts/MenuContext';

export function DailySalesReport() {
  const dailySales = getDailySalesReport();
  const { menuItems } = useMenu();

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
          Ventas del Día
        </h2>
        <p className="text-lg font-semibold text-orange-600">
          Total: ${dailySales.total.toFixed(2)}
        </p>
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
                      {menuItem?.name} x {item.quantity}
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