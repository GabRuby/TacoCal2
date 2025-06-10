import { MenuItem, TacoOrder } from '../../types';

export function calculateTotal(menuItems: MenuItem[], order: TacoOrder[]): number {
  return order.reduce((total, item) => {
    const menuItem = menuItems.find(m => m.id === item.id);
    if (!menuItem) return total;
    return total + (menuItem.price * item.quantity);
  }, 0);
}