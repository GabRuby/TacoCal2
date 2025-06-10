import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessConfig } from '../types';
import { getConfig, saveConfig } from '../utils/config';

interface ConfigContextType {
  config: BusinessConfig;
  setConfig: (config: BusinessConfig) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<BusinessConfig>(() => getConfig());

  // Función wrapper para setConfig que también guarda en localStorage
  const setConfig = (newConfig: BusinessConfig) => {
    setConfigState(newConfig);
    saveConfig(newConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider');
  }
  return context;
}