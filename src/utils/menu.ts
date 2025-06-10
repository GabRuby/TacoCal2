import { MenuItem } from '../types';

const MENU_KEY = 'menu_items';

export function saveMenu(items: MenuItem[]): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

export function getMenu(): MenuItem[] {
  const items = localStorage.getItem(MENU_KEY);
  if (!items) return [];
  
  try {
    const parsedItems = JSON.parse(items);
    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch {
    // Si hay un error al parsear, limpiar el localStorage y retornar array vacío
    clearMenu();
    return [];
  }
}

export function clearMenu(): void {
  localStorage.removeItem(MENU_KEY);
} 