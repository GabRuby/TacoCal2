// types/index.tsx

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isPesos?: boolean;
  unit?: string; // Nuevo campo para la unidad de medida
}

export interface TacoOrder {
  id: string;
  quantity: number;
}

export interface Table {
  id: string;
  number: number;
  name?: string; // <- Nuevo campo para nombre personalizado
  status: 'available' | 'occupied';
  customerName?: string;
  observations?: string;
  currentOrder?: TacoOrder[];
  startTime?: string;
  payment?: {
    amount: number;
    method: 'cash' | 'transfer' | 'card' | 'mixed' | 'NoEsp'; // Incluir todos los métodos posibles
    cashPart?: number; // Parte del pago en efectivo
    transferPart?: number; // Parte del pago por transferencia
    cardPart?: number; // Parte del pago con tarjeta
  };
}

export interface TablesState {
  tables: Table[];
  activeTableId: string | null;
}

export interface Sale {
  id: string;
  items: TacoOrder[];
  total: number;
  timestamp: string;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'mixed' | 'NoEsp';
  businessId?: string;
  waiterId?: string;
}

export interface DailySale extends Sale {
  tableNumber: number;
  tableId: string;
  tableNameAtSale?: string;
  status?: 'pending' | 'exported' | 'imported';
  cashPart?: number; // Parte del pago mixto en efectivo
  transferPart?: number; // Parte del pago mixto en transferencia
  cardPart?: number; // Parte del pago con tarjeta (usado en mixed o para pagos completos con tarjeta si se registra así)
}

// Nueva interfaz para definir los horarios de cada día de la semana
export interface WorkingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string; // Formato HH:MM (ej. "05:00", "16:30")
  closeTime: string; // Formato HH:MM (ej. "23:00", "00:30" para jornada que cruza la medianoche)
  isClosed: boolean; // Para marcar si el negocio está cerrado ese día
}

// Interfaz para la definición de una moneda
export interface Currency {
  code: string;       // Ej: 'MXN', 'USD', 'EUR'
  symbol: string;     // Ej: '$', '€'
  name: string;       // Ej: 'Peso Mexicano', 'Dólar Estadounidense'
  symbolPlacement: 'before' | 'after'; // Si el símbolo va antes o después del monto
}

// Lista predefinida de monedas disponibles para seleccionar en la UI
export const CURRENCIES: Currency[] = [
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', symbolPlacement: 'before' },
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', symbolPlacement: 'before' },
  { code: 'EUR', symbol: '€', name: 'Euro', symbolPlacement: 'before' },
  // Agrega más monedas según sea necesario
];

export interface BusinessConfig {
  name: string;
  imageUrl: string;
  backgroundUrl: string;

  // --- CAMPOS PARA BANCO (Punto 1 del plan) ---
  bankName?: string;
  bankBeneficiary?: string;
  accountNumber?: string;
  clabe?: string; // CLABE interbancaria (específico de México)

  // --- CAMPOS PARA MONEDA Y HORARIO (Punto 3 y 4 del plan) ---
  currencyCode: string; // El código de la moneda seleccionada de CURRENCIES
  workingHours: WorkingHours[]; // Array de objetos con horarios por día
  timeZone: string; // Ej: 'America/Mexico_City', 'America/Cancun'. Importante para manejo de hora

  // --- CAMPOS PARA SEGURIDAD (Punto 2 del plan) ---
  adminPin?: string; // Para un PIN de administrador, preferiblemente hasheado en un entorno real. Aquí como string por simplicidad
  recoveryQuestion?: string; // Pregunta de recuperación (ej. "¿Cuál fue tu primer mascota?")
  recoveryAnswer?: string;   // Respuesta de recuperación
  nipEnabled: boolean;      // Indica si el NIP está activo o no

  // --- CAMPO PARA TÍTULO DEL REPORTE ---
  reportTitle?: string; // Título personalizable para el reporte diario

  // --- CAMPO PARA NOMBRE DE ARCHIVO DE EXCEL ---
  excelFileName?: string; // Nombre base personalizable para el archivo de Excel
}

// Valores por defecto sugeridos para BusinessConfig (para inicializar si no hay configuración guardada)
export const defaultConfig: BusinessConfig = {
  name: 'Mi Negocio',
  imageUrl: '',
  backgroundUrl: '',
  currencyCode: 'MXN', // Moneda por defecto
  workingHours: [
    { day: 'monday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'tuesday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'wednesday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'thursday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'friday', openTime: '09:00', closeTime: '23:00', isClosed: false },
    { day: 'saturday', openTime: '10:00', closeTime: '23:00', isClosed: false },
    { day: 'sunday', openTime: '10:00', closeTime: '20:00', isClosed: true }, // Ejemplo: domingo cerrado por defecto
  ],
  timeZone: 'America/Mexico_City', // Zona horaria por defecto para la jornada
  adminPin: '1234', // PIN por defecto (¡CAMBIAR EN PRODUCCIÓN!)
  recoveryQuestion: '', // Valor por defecto
  recoveryAnswer: '',   // Valor por defecto
  nipEnabled: false,    // NIP desactivado por defecto
  reportTitle: 'Reporte Diario de Ventas', // Título por defecto del reporte
  excelFileName: 'Reporte_Diario_Ventas', // Nombre de archivo de Excel por defecto
};

export interface ProductSummary {
  id: string;
  name: string;
  quantity: number;
  total: number;
}