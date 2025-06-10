// dailySales.ts
import { DailySale, TacoOrder, MenuItem, WorkingHours } from '../types';
import { calculateTotal } from './calculations/total';
import { getMenu } from './menu';
import { getConfig } from './config';

const DAILY_SALES_KEY = 'daily_sales';

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

interface ProductSummary {
  id: string;
  name: string;
  quantity: number;
  total: number;
}

export interface DailySales {
  date: string;
  sales: DailySale[];
  total: number;
}

export interface DailySalesSummary extends DailySales {
  products: ProductSummary[];
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function shouldResetSales(): boolean {
  const now = new Date();
  const config = getConfig();
  const currentDay = now.getDay();
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = days[currentDay];

  // Get working hours for the current day
  const workingHours = config.workingHours.find(wh => wh.day === currentDayName);
  if (!workingHours || workingHours.isClosed) return false;

  // Get opening time and subtract 1 minute
  const [hours, minutes] = workingHours.openTime.split(':').map(Number);
  const resetTime = new Date(now);
  resetTime.setHours(hours, minutes - 1, 0, 0);

  // Check if current time is within 1 minute of reset time
  const timeDiff = Math.abs(now.getTime() - resetTime.getTime());
  return timeDiff <= 60000; // 60000 ms = 1 minute
}

function getDailySales(): DailySalesSummary {
  const data = localStorage.getItem(DAILY_SALES_KEY);
  const defaultSales: DailySalesSummary = {
    date: getTodayKey(),
    sales: [],
    total: 0,
    products: []
  };

  const sales: DailySalesSummary = data ? JSON.parse(data) : defaultSales;

  // Reset if it's time for the working day reset
  if (shouldResetSales()) {
    return defaultSales;
  }

  return sales;
}

function saveDailySales(sales: DailySalesSummary): void {
  localStorage.setItem(DAILY_SALES_KEY, JSON.stringify(sales));
}

function updateProductSummary(products: ProductSummary[], order: TacoOrder[], menuItems: MenuItem[]): ProductSummary[] {
  const updatedProducts = [...products];

  order.forEach(orderItem => {
    const menuItem = menuItems.find(m => m.id === orderItem.id);
    if (!menuItem) return;

    const existingProduct = updatedProducts.find(p => p.id === orderItem.id);
    if (existingProduct) {
      existingProduct.quantity += orderItem.quantity;
      existingProduct.total += menuItem.price * orderItem.quantity;
    } else {
      updatedProducts.push({
        id: orderItem.id,
        name: menuItem.name,
        quantity: orderItem.quantity,
        total: menuItem.price * orderItem.quantity
      });
    }
  });

  return updatedProducts;
}

export function addSaleToDaily(sale: Omit<DailySale, 'id' | 'tableId' | 'tableNameAtSale'>, tableId: string, tableNameAtSale: string): DailySale {
  const menuItems = getMenu();
  const total = calculateTotal(menuItems, sale.items);

  const newSale: DailySale = {
    id: crypto.randomUUID(),
    ...sale,
    tableId,
    tableNameAtSale,
    total
  };

  const dailySales = getDailySales();
  dailySales.sales.push(newSale);
  dailySales.total += total;
  dailySales.products = updateProductSummary(dailySales.products, sale.items, menuItems);

  saveDailySales(dailySales);

  return newSale;
}

export function getDailySalesReport(): DailySalesSummary {
  return getDailySales();
}

export function clearDailySales(): void {
  localStorage.removeItem(DAILY_SALES_KEY);
}

export function exportDailySales(): void {
  const dailySales = getDailySales();
  const dataStr = JSON.stringify(dailySales, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `ventas-${dailySales.date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importDailySales(jsonContent: string): void {
  try {
    const importedSales: DailySalesSummary = JSON.parse(jsonContent);
    const currentSales = getDailySales();

    // Comentamos la verificación de fecha ya que ahora permitimos importar ventas de diferentes días
    // if (importedSales.date !== currentSales.date) {
    //   throw new Error('Solo se pueden importar ventas del día actual');
    // }

    // Merge sales
    const mergedSales: DailySalesSummary = {
      date: currentSales.date,
      sales: [...currentSales.sales],
      total: currentSales.total,
      products: [...currentSales.products]
    };

    // Add new sales
    importedSales.sales.forEach(sale => {
      if (!mergedSales.sales.some(s => s.id === sale.id)) {
        mergedSales.sales.push(sale);
        mergedSales.total += sale.total;
      }
    });

    // Recalculate product summary
    const menuItems = getMenu();
    mergedSales.products = [];
    mergedSales.sales.forEach(sale => {
      mergedSales.products = updateProductSummary(mergedSales.products, sale.items, menuItems);
    });

    saveDailySales(mergedSales);
  } catch (error) {
    console.error('Error importing sales:', error);
    throw new Error('Error al importar las ventas');
  }
}