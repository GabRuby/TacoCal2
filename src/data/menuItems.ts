import { getMenu } from '../utils/menu';

// Menu categories
export const CATEGORIES = {
  MAIN: 'main',    // Alimentos
  DRINKS: 'drinks' // Bebidas
} as const;

// Default menu items - lista vacía por defecto
export const defaultMenuItems: Array<{
  id: string;
  name: string;
  price: number;
  category: string;
  isPesos?: boolean;
}> = [];

// Get menu items from storage or use defaults
export const menuItems = getMenu().length > 0 ? getMenu() : defaultMenuItems;
