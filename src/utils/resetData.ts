import { BusinessConfig, defaultConfig } from '../types/index';
import { saveConfig } from './config';
import { saveMenu, clearMenu } from './menu';
import { defaultMenuItems } from '../data/menuItems';

/**
 * Reinicia la sección General de la configuración
 * @param currentConfig Configuración actual
 * @returns Nueva configuración con la sección General reiniciada
 */
export const resetGeneralSection = (currentConfig: BusinessConfig): BusinessConfig => {
  // Crear una nueva configuración con los valores por defecto
  const newConfig: BusinessConfig = {
    ...defaultConfig,
    // Mantener los valores que no son parte de la sección General
    bankName: currentConfig.bankName,
    bankBeneficiary: currentConfig.bankBeneficiary,
    accountNumber: currentConfig.accountNumber,
    clabe: currentConfig.clabe,
    currencyCode: currentConfig.currencyCode,
    workingHours: currentConfig.workingHours,
    timeZone: currentConfig.timeZone,
    adminPin: currentConfig.adminPin,
    recoveryQuestion: currentConfig.recoveryQuestion,
    recoveryAnswer: currentConfig.recoveryAnswer,
    nipEnabled: currentConfig.nipEnabled,
  };

  return newConfig;
};

/**
 * Reinicia la sección Banco de la configuración
 * @param currentConfig Configuración actual
 * @returns Nueva configuración con la sección Banco reiniciada
 */
export const resetBankSection = (currentConfig: BusinessConfig): BusinessConfig => {
  // Crear una nueva configuración manteniendo los valores actuales
  const newConfig: BusinessConfig = {
    ...currentConfig,
    // Reiniciar valores de la sección Banco a undefined
    bankName: undefined,
    bankBeneficiary: undefined,
    accountNumber: undefined,
    clabe: undefined,
  };

  return newConfig;
};

export function resetMenuSection() {
  // Limpiar completamente el menú
  clearMenu();
  // Asegurarnos de que se guarde un array vacío
  saveMenu([]);
  return [];
}

/**
 * Guarda la configuración reiniciada
 * @param config Nueva configuración
 * @param menuItems Items del menú (opcional)
 */
export async function saveResetConfig(config: BusinessConfig, menuItems?: typeof defaultMenuItems) {
  try {
    // Guardar la configuración
    await saveConfig(config);
    
    // Si se proporcionaron items del menú, guardarlos también
    if (menuItems) {
      await saveMenu(menuItems);
    }

    // Forzar una recarga de la página para asegurar que todos los cambios se apliquen
    window.location.reload();
  } catch (error) {
    console.error('Error al guardar la configuración reiniciada:', error);
    throw new Error('No se pudo guardar la configuración reiniciada');
  }
} 