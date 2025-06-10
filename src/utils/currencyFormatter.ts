// src/utils/currencyFormatter.ts

/**
 * Formatea un número como moneda con separadores de miles y dos decimales,
 * según el código de moneda y el locale especificados.
 * @param amount El número a formatear.
 * @param currencyCode El código ISO de la moneda (ej. 'MXN', 'USD', 'EUR'). Por defecto 'MXN'.
 * @param locale El locale a usar para el formato (ej. 'es-MX', 'en-US'). Por defecto 'es-MX'.
 * @returns El número formateado como string (ej. "$1,234.56", "€1.234,56").
 */
export const formatCurrency = (
    amount: number,
    currencyCode: string = 'MXN', // Nuevo parámetro con valor por defecto
    locale: string = 'es-MX'     // Nuevo parámetro con valor por defecto
  ): string => {
    // Asegurarse de que el input sea un número válido
    if (typeof amount !== 'number' || isNaN(amount)) {
      // Si el monto no es válido, intentamos formatear 0 con la moneda especificada
      // para que al menos se vea el símbolo de la moneda correcta si es posible.
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(0);
      } catch (error) {
        // Fallback si la moneda o locale no son válidos
        console.error("Error al formatear moneda para valor inválido:", error);
        return "$0.00";
      }
    }
  
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  
    return formatter.format(amount);
  };