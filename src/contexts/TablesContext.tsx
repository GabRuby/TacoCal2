import React, { createContext, useContext, useState } from 'react';
import { Table, TablesState, TacoOrder } from '../types';

const TablesContext = createContext<TablesContextType | undefined>(undefined);

const TABLES_KEY = 'restaurant_tables';

interface TablesContextType extends TablesState {
  addTable: (number: number) => void;
  removeTable: (id: string) => void;
  startOrder: (tableId: string) => void;
  updateOrder: (tableId: string, order: TacoOrder[]) => void;
  updateTableInfo: (tableId: string, updates: Partial<Table>) => void;
  closeTable: (tableId: string) => void;
  setActiveTable: (tableId: string | null) => void;
  updatePayment: (tableId: string, payment: { amount: number; method: 'cash' | 'transfer' | 'card' | 'mixed' | 'NoEsp'; cashPart?: number; transferPart?: number; cardPart?: number; }) => void;
}

export function TablesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TablesState>(() => {
    const saved = localStorage.getItem(TABLES_KEY);
    return saved ? JSON.parse(saved) : { tables: [], activeTableId: null };
  });

  const saveState = (newState: TablesState) => {
    setState(newState);
    localStorage.setItem(TABLES_KEY, JSON.stringify(newState));
  };

  const addTable = (number: number) => {
    const newTable: Table = {
      id: crypto.randomUUID(),
      number,
      status: 'available',
      customerName: '',
      observations: ''
    };
    saveState({
      ...state,
      tables: [...state.tables, newTable]
    });
  };

  const removeTable = (id: string) => {
    saveState({
      ...state,
      tables: state.tables.filter(table => table.id !== id),
      activeTableId: state.activeTableId === id ? null : state.activeTableId
    });
  };

  const startOrder = (tableId: string) => {
    saveState({
      ...state,
      tables: state.tables.map(table => 
        table.id === tableId
          ? {
              ...table,
              status: 'occupied',
              currentOrder: [],
              startTime: new Date().toISOString()
            }
          : table
      ),
      activeTableId: tableId
    });
  };

  const updateOrder = (tableId: string, order: TacoOrder[]) => {
    saveState({
      ...state,
      tables: state.tables.map(table =>
        table.id === tableId
          ? { ...table, currentOrder: order }
          : table
      )
    });
  };

  const updateTableInfo = (tableId: string, updates: Partial<Table>) => {
    saveState({
      ...state,
      tables: state.tables.map(table =>
        table.id === tableId
          ? { ...table, ...updates }
          : table
      )
    });
  };

  const updatePayment = (tableId: string, payment: { amount: number; method: 'cash' | 'transfer' | 'card' | 'mixed' | 'NoEsp'; cashPart?: number; transferPart?: number; cardPart?: number; }) => {
    saveState({
      ...state,
      tables: state.tables.map(table =>
        table.id === tableId
          ? { ...table, payment: { ...payment } }
          : table
      )
    });
  };

  const closeTable = (tableId: string) => {
    saveState({
      ...state,
      tables: state.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              status: 'available',
              currentOrder: undefined,
              startTime: undefined,
              customerName: '',
              observations: '',
              payment: undefined
            }
          : table
      ),
      activeTableId: state.activeTableId === tableId ? null : state.activeTableId
    });
  };

  const setActiveTable = (tableId: string | null) => {
    saveState({ ...state, activeTableId: tableId });
  };

  return (
    <TablesContext.Provider value={{
      ...state,
      addTable,
      removeTable,
      startOrder,
      updateOrder,
      updateTableInfo,
      closeTable,
      setActiveTable,
      updatePayment
    }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error('useTables must be used within TablesProvider');
  }
  return context;
} 