// SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Settings, UtensilsCrossed, Home, Clock, Lock, Info, RefreshCw } from 'lucide-react';
import { BusinessConfig, defaultConfig } from '../../types';
import { saveConfig } from '../../utils/config';
import { saveMenu, getMenu } from '../../utils/menu';
import { SettingsForm } from './SettingsForm';
import { MenuManagement } from './MenuManagement';
import { menuItems } from '../../data/menuItems';
import { BankSettingsForm } from './BankSettingsForm';
import { CurrencyTimeSettingsForm } from './CurrencyTimeSettingsForm';
import { SecuritySettingsForm } from './SecuritySettingsForm';
import { AboutTab } from './AboutTab';
import { ResetDataForm } from './ResetDataForm';
import { useMenu } from '../../contexts/MenuContext';

const modalStyles = `
  .modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }
`;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: BusinessConfig;
  onConfigUpdate: (config: BusinessConfig) => void;
  showNameField?: boolean;
  activeTab?: 'general' | 'menu' | 'bank' | 'currencyAndTime' | 'security' | 'resetData' | 'about';
}

export function SettingsModal({
  isOpen,
  onClose,
  currentConfig,
  onConfigUpdate,
  showNameField = true,
  activeTab = 'general'
}: SettingsModalProps) {
  const [config, setConfig] = useState<BusinessConfig>(() => {
    const mergedConfig = {
      ...defaultConfig,
      ...currentConfig,
    };

    if (currentConfig.workingHours && Array.isArray(currentConfig.workingHours) && currentConfig.workingHours.length > 0) {
      mergedConfig.workingHours = currentConfig.workingHours;
    } else {
      mergedConfig.workingHours = defaultConfig.workingHours;
    }

    return mergedConfig;
  });
  const [items, setItems] = useState(() => getMenu());
  const [error, setError] = useState('');
  const [currentActiveTab, setCurrentActiveTab] = useState<'general' | 'menu' | 'bank' | 'currencyAndTime' | 'security' | 'resetData' | 'about'>(activeTab);
  const { refreshMenu } = useMenu();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    setCurrentActiveTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const mergedConfig = {
      ...defaultConfig,
      ...currentConfig,
    };

    if (currentConfig.workingHours && Array.isArray(currentConfig.workingHours) && currentConfig.workingHours.length > 0) {
      mergedConfig.workingHours = currentConfig.workingHours;
    } else {
      mergedConfig.workingHours = defaultConfig.workingHours;
    }

    setConfig(mergedConfig);
    setItems(getMenu());
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (currentActiveTab === 'general' && showNameField && !config.name.trim()) {
      setError('El nombre del negocio es requerido');
      return;
    }

    setError('');
    saveConfig(config);
    saveMenu(items);
    onConfigUpdate(config);
    onClose();
  };

  const handleClose = () => {
    refreshMenu();
    const mergedConfig = {
      ...defaultConfig,
      ...currentConfig,
    };
    setConfig(mergedConfig);
    setItems(getMenu());
    onConfigUpdate(mergedConfig);
    onClose();
  };

  return (
    <>
      <style>{modalStyles}</style>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Configuración</h2>
            <h3 className="text-sm text-gray-600 mt-1">
              {currentActiveTab === 'general' && 'Generales'}
              {currentActiveTab === 'menu' && 'Gestión del Menú'}
              {currentActiveTab === 'bank' && 'Configuración Bancaria'}
              {currentActiveTab === 'currencyAndTime' && 'Moneda y Horario'}
              {currentActiveTab === 'security' && 'Seguridad'}
              {currentActiveTab === 'resetData' && 'Reinicio de Datos'}
              {currentActiveTab === 'about' && 'Acerca de la Aplicación'}
            </h3>
          </div>
          <button
                  onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1 pt-2 px-2">
          <button
            onClick={() => setCurrentActiveTab('general')}
            className={`
              relative
              px-3 py-2
              text-sm font-medium
              rounded-t-lg
              min-h-12
                flex items-center justify-center gap-2
              ${
                currentActiveTab === 'general'
                  ? 'bg-orange-600 text-white border border-b-0 border-orange-600 z-10 -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
              <Settings size={20} className="md:hidden" />
              <span className="hidden md:inline">General</span>
          </button>
          <button
            onClick={() => setCurrentActiveTab('menu')}
            className={`
              relative
              px-3 py-2
              text-sm font-medium
              rounded-t-lg
              min-h-12
                flex items-center justify-center gap-2
              ${
                currentActiveTab === 'menu'
                  ? 'bg-orange-600 text-white border border-b-0 border-orange-600 z-10 -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
              <UtensilsCrossed size={20} className="md:hidden" />
              <span className="hidden md:inline">Menú</span>
          </button>
          <button
            onClick={() => setCurrentActiveTab('bank')}
            className={`
              relative
              px-3 py-2
              text-sm font-medium
              rounded-t-lg
              min-h-12
                flex items-center justify-center gap-2
              ${
                currentActiveTab === 'bank'
                  ? 'bg-orange-600 text-white border border-b-0 border-orange-600 z-10 -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
              <Home size={20} className="md:hidden" />
              <span className="hidden md:inline">Banco</span>
          </button>
          <button
            onClick={() => setCurrentActiveTab('currencyAndTime')}
            className={`
              relative
              px-3 py-2
              text-sm font-medium
              rounded-t-lg
              min-h-12
                flex items-center justify-center gap-2
              ${
                currentActiveTab === 'currencyAndTime'
                  ? 'bg-orange-600 text-white border border-b-0 border-orange-600 z-10 -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
              <Clock size={20} className="md:hidden" />
              <span className="hidden md:inline">Moneda y Horario</span>
          </button>
          <button
            onClick={() => setCurrentActiveTab('security')}
            className={`
              relative
              px-3 py-2
              text-sm font-medium
              rounded-t-lg
              min-h-12
                flex items-center justify-center gap-2
              ${
                currentActiveTab === 'security'
                  ? 'bg-orange-600 text-white border border-b-0 border-orange-600 z-10 -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
              <Lock size={20} className="md:hidden" />
              <span className="hidden md:inline">Seguridad</span>
          </button>
          <button
            onClick={() => setCurrentActiveTab('resetData')}
            className={`
              relative
              px-3 py-2
              text-sm font-medium
              rounded-t-lg
              min-h-12
                flex items-center justify-center gap-2
              ${
                currentActiveTab === 'resetData'
                  ? 'bg-yellow-500 text-black border border-b-0 border-yellow-500 z-10 -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
              <RefreshCw size={20} className="md:hidden" />
              <span className="hidden md:inline">Reiniciar Datos</span>
          </button>
          <button
            onClick={() => setCurrentActiveTab('about')}
            className={`
              relative
              px-3 py-2
              text-sm font-medium
              rounded-t-lg
              min-h-12
                flex items-center justify-center gap-2
              ${
                currentActiveTab === 'about'
                  ? 'bg-orange-600 text-white border border-b-0 border-orange-600 z-10 -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
              <Info size={20} className="md:hidden" />
              <span className="hidden md:inline">Acerca de</span>
          </button>
        </div>
        <div className="border-b border-gray-300 w-full -mt-px"></div>

        <div className="flex-1 flex flex-col min-h-0">
          {currentActiveTab === 'general' && (
            <div className="border-b border-gray-200 bg-orange-100 px-4 py-3 flex-shrink-0">
              <h4 className="text-base font-bold text-gray-800">Generales del Negocio</h4>
            </div>
          )}
          {currentActiveTab === 'bank' && (
            <div className="border-b border-gray-200 bg-orange-100 px-4 py-3 flex-shrink-0">
              <h4 className="text-base font-bold text-gray-800">Configuración Bancaria</h4>
            </div>
          )}
          {currentActiveTab === 'currencyAndTime' && (
            <div className="border-b border-gray-200 bg-orange-100 px-4 py-3 flex-shrink-0">
              <h4 className="text-base font-bold text-gray-800">Moneda y Horario de Operación</h4>
            </div>
          )}
          {currentActiveTab === 'security' && (
            <div className="border-b border-gray-200 bg-orange-100 px-4 py-3 flex-shrink-0">
              <h4 className="text-base font-bold text-gray-800">Autenticación Requerida</h4>
            </div>
          )}
          {currentActiveTab === 'resetData' && (
            <div className="border-b border-gray-200 bg-orange-100 px-4 py-3 flex-shrink-0">
              <h4 className="text-base font-bold text-gray-800">Reiniciar Datos del Negocio</h4>
            </div>
          )}
          {currentActiveTab === 'about' && (
            <div className="border-b border-gray-200 bg-orange-100 px-4 py-3 flex-shrink-0">
              <h4 className="text-base font-bold text-gray-800">Acerca de CalcTac</h4>
            </div>
          )}

          {currentActiveTab === 'general' && (
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Negocio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    error && !config.name.trim() ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del negocio"
                />
              </div>
              <div>
                <SettingsForm
                  config={config}
                  onConfigChange={setConfig}
                  error={error}
                  showNameField={false}
                />
              </div>
            </div>
          )}
          {currentActiveTab === 'menu' && (
                  <div className="flex-1 overflow-y-auto min-h-0 p-4">
            <MenuManagement
              items={items}
                      onItemsChange={(newItems) => {
                        setItems(newItems);
                        saveMenu(newItems);
                      refreshMenu();
                      }}
                    />
                  </div>
          )}
          {currentActiveTab === 'bank' && (
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <BankSettingsForm
                config={config}
                onConfigChange={setConfig}
              />
            </div>
          )}
          {currentActiveTab === 'currencyAndTime' && (
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <CurrencyTimeSettingsForm
                config={config}
                onConfigChange={setConfig}
              />
            </div>
          )}
          {currentActiveTab === 'security' && (
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <SecuritySettingsForm
                config={config}
                onConfigChange={setConfig}
              />
            </div>
          )}
          {currentActiveTab === 'resetData' && (
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
                    <ResetDataForm 
                      onClose={() => {
                        const mergedConfig = {
                          ...defaultConfig,
                          ...currentConfig,
                        };
                        setConfig(mergedConfig);
                        setItems(getMenu());
                        refreshMenu();
                        onConfigUpdate(mergedConfig);
                        onClose();
                      }} 
                    />
            </div>
          )}
          {currentActiveTab === 'about' && (
            <AboutTab />
          )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-3 min-h-[60px] flex-shrink-0">
          {error && (
            <div className="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {!error && currentActiveTab === 'general' && (
            <div className="text-sm text-gray-500">
              Los campos marcados con <span className="text-red-500">*</span> son obligatorios
            </div>
          )}
        </div>

            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-end gap-2">
            <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
            </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}