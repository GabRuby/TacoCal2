import { useMenu } from '../../contexts/MenuContext';
import { calculateTotal } from './total';
import { TacoOrder } from '../../types';

export function useCalculateTotal() {
  const { menuItems } = useMenu();
  
  return (order: TacoOrder[]): number => {
    return calculateTotal(menuItems, order);
  };
}