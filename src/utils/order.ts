import { TacoOrder } from '../types';

export function hasValidOrder(order: TacoOrder[]): boolean {
  return order.length > 0 && order.some(item => item.quantity > 0);
}