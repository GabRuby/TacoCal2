export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  } else {
    return quantity.toFixed(2);
  }
} 