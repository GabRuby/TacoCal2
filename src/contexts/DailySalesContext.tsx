import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DailySalesSummary, getDailySalesReport } from '../utils/dailySales';

interface DailySalesContextType {
  dailySales: DailySalesSummary;
  refreshDailySales: () => void;
  // No exponemos saveDailySales directamente aquí para evitar que se use incorrectamente,
  // la actualización principal debe venir de addSaleToDaily
}

const DailySalesContext = createContext<DailySalesContextType | undefined>(undefined);

export function DailySalesProvider({ children }: { children: React.ReactNode }) {
  const [dailySales, setDailySales] = useState<DailySalesSummary>(getDailySalesReport());

  const refreshDailySales = useCallback(() => {
    setDailySales(getDailySalesReport());
  }, []);

  // Opcional: Escuchar cambios en localStorage si otras partes de la app lo modifican directamente
  // Si `addSaleToDaily` siempre se usa para modificar, esto puede ser menos necesario.
  // Pero es una buena práctica para asegurar consistencia.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'daily_sales') {
        refreshDailySales();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshDailySales]);

  return (
    <DailySalesContext.Provider value={{ dailySales, refreshDailySales }}>
      {children}
    </DailySalesContext.Provider>
  );
}

export function useDailySales() {
  const context = useContext(DailySalesContext);
  if (context === undefined) {
    throw new Error('useDailySales must be used within a DailySalesProvider');
  }
  return context;
} 