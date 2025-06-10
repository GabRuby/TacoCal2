import { TacoOrder } from '../types';
import { useMenu } from '../contexts/MenuContext';

export function useCalculateTotal() {
  const { menuItems } = useMenu();
  
  return (order: TacoOrder[]): number => {
    return order.reduce((total, item) => {
      const menuItem = menuItems.find(m => m.id === item.id);
      if (!menuItem) return total;
      return total + (menuItem.price * item.quantity);
    }, 0);
  };
}