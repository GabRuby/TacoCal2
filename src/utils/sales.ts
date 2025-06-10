import { Sale, TacoOrder } from '../types';
import { calculateTotal } from './calculations/total';
import { useMenu } from '../contexts/MenuContext';

export function saveSale(order: TacoOrder[]): Sale {
  const menuItems = JSON.parse(localStorage.getItem('menu_items') || '[]');
  
  const sale: Sale = {
    id: crypto.randomUUID(),
    items: [...order],
    total: calculateTotal(menuItems, order),
    timestamp: new Date().toISOString()
  };

  const sales = getSales();
  sales.push(sale);
  localStorage.setItem('sales', JSON.stringify(sales));
  
  return sale;
}

export function getSales(): Sale[] {
  const salesData = localStorage.getItem('sales');
  return salesData ? JSON.parse(salesData) : [];
}

export function clearSales(): void {
  localStorage.removeItem('sales');
}