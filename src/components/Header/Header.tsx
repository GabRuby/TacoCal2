import React, { useState, useEffect } from 'react';
import { Settings, UtensilsCrossed, ListOrdered, X, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import { useMenu } from '../../contexts/MenuContext';
import { SettingsModal } from '../Settings/SettingsModal';
import { ImagePreviewModal } from '../Settings/ImagePreview/ImagePreviewModal';

interface HeaderProps {
  onOpenSettings: () => void;
}

type NipView = 'auth' | 'recovery' | 'recoveryNewPin';
type AuthAction = 'imageEdit' | 'nameEdit' | 'menuSettings' | 'settings' | 'toggleNip';

export function Header({ onOpenSettings }: HeaderProps) {
  const { config, setConfig } = useConfig();
  const { menuItems, refreshMenu } = useMenu();
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'menu' | 'bank' | 'currencyAndTime' | 'security' | 'resetData'>('general');
  const [tempConfig, setTempConfig] = useState(config);
  const [showNipAuth, setShowNipAuth] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [nipView, setNipView] = useState<NipView>('auth');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingAction, setPendingAction] = useState<AuthAction | null>(null);

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleSaveConfig = () => {
    setConfig(tempConfig);
    setShowNameEdit(false);
    setShowImageEdit(false);
  };

  const handleOpenMenuSettings = () => {
    if (config.nipEnabled) {
      setPendingAction('menuSettings');
      setShowNipAuth(true);
      setNipView('auth');
      setAuthPin('');
      setAuthError('');
    } else {
      setActiveSettingsTab('menu');
      setShowSettings(true);
    }
  };

  const handleOpenSettings = () => {
    if (config.nipEnabled) {
      setPendingAction('settings');
      setShowNipAuth(true);
      setNipView('auth');
      setAuthPin('');
      setAuthError('');
    } else {
      onOpenSettings();
    }
  };

  const handleOpenImageEdit = () => {
    if (config.nipEnabled) {
      setPendingAction('imageEdit');
      setShowNipAuth(true);
      setNipView('auth');
      setAuthPin('');
      setAuthError('');
    } else {
      setShowImageEdit(true);
    }
  };

  const handleOpenNameEdit = () => {
    if (config.nipEnabled) {
      setPendingAction('nameEdit');
      setShowNipAuth(true);
      setNipView('auth');
      setAuthPin('');
      setAuthError('');
    } else {
      setShowNameEdit(true);
    }
  };

  const handleToggleNip = () => {
    if (!config.nipEnabled) {
      setConfig({ ...config, nipEnabled: true });
    } else {
      setPendingAction('toggleNip');
      setShowNipAuth(true);
      setNipView('auth');
      setAuthPin('');
      setAuthError('');
    }
  };

  const executePendingAction = () => {
    if (!pendingAction) return;

    switch (pendingAction) {
      case 'imageEdit':
        setShowImageEdit(true);
        break;
      case 'nameEdit':
        setShowNameEdit(true);
        break;
      case 'menuSettings':
        setActiveSettingsTab('menu');
        setShowSettings(true);
        break;
      case 'settings':
        onOpenSettings();
        break;
      case 'toggleNip':
        setConfig({ ...config, nipEnabled: false });
        break;
    }
    setPendingAction(null);
  };

  const handleNipAuth = () => {
    if (authPin === config.adminPin) {
      executePendingAction();
      setShowNipAuth(false);
      setAuthPin('');
      setAuthError('');
      setNipView('auth');
    } else {
      setAuthError('NIP incorrecto');
    }
  };

  const handleRecoverySubmit = () => {
    if (!config.recoveryQuestion || !config.recoveryAnswer) {
      setRecoveryError('No hay pregunta de recuperación configurada');
      return;
    }

    if (recoveryAnswer.toLowerCase().trim() === config.recoveryAnswer.toLowerCase().trim()) {
      setNipView('recoveryNewPin');
      setRecoveryError('');
    } else {
      setRecoveryError('Respuesta incorrecta');
    }
  };

  const handleRecoveryNewPin = () => {
    if (newPin && newPin === newPinConfirm) {
      setConfig({ ...config, adminPin: newPin });
      setConfig({ ...config, nipEnabled: false });
      setShowNipAuth(false);
      setNewPin('');
      setNewPinConfirm('');
      setPinError('');
      setNipView('auth');
    } else {
      setPinError('Por favor, ingresa y confirma el NIP correctamente');
    }
  };

  const renderNipModal = () => {
    if (!showNipAuth) return null;

    switch (nipView) {
      case 'auth':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Autenticación Requerida</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Se requiere el NIP de administrador para desactivar la protección.
                </p>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    authError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
                  }`}
                  placeholder="Ingresa tu NIP"
                  maxLength={6}
                />
                {authError && (
                  <div className="mt-2">
                    <p className="text-red-500 text-xs">{authError}</p>
                    <button
                      onClick={() => setNipView('recovery')}
                      className="text-sm text-orange-600 hover:text-orange-700 mt-1"
                    >
                      ¿Olvidaste tu NIP?
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                <button
                  onClick={() => {
                    setShowNipAuth(false);
                    setAuthPin('');
                    setAuthError('');
                    setNipView('auth');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNipAuth}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                >
                  Verificar
                </button>
              </div>
            </div>
          </div>
        );

      case 'recovery':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Recuperar NIP</h2>
              </div>
              <div className="p-4">
                {!config.recoveryQuestion ? (
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600">No hay pregunta de recuperación configurada.</p>
                    <button
                      onClick={() => setNipView('auth')}
                      className="mt-4 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                    >
                      Volver
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pregunta de Recuperación
                      </label>
                      <p className="text-gray-600 mb-4">{config.recoveryQuestion}</p>
                      
                      <label htmlFor="recoveryAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                        Tu Respuesta
                      </label>
                      <input
                        type="text"
                        id="recoveryAnswer"
                        value={recoveryAnswer}
                        onChange={(e) => setRecoveryAnswer(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          recoveryError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
                        }`}
                        placeholder="Ingresa tu respuesta"
                      />
                      {recoveryError && <p className="text-red-500 text-xs mt-1">{recoveryError}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setNipView('auth')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRecoverySubmit}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                      >
                        Verificar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'recoveryNewPin':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Establecer Nuevo NIP</h2>
              </div>
              <div className="p-4">
                <div>
                  <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevo NIP
                  </label>
                  <input
                    type="password"
                    id="newPin"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Establece un NIP de 4-6 dígitos"
                    maxLength={6}
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="newPinConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nuevo NIP
                  </label>
                  <input
                    type="password"
                    id="newPinConfirm"
                    value={newPinConfirm}
                    onChange={(e) => setNewPinConfirm(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      pinError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
                    }`}
                    placeholder="Confirma tu NIP"
                    maxLength={6}
                  />
                  {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setNipView('recovery')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRecoveryNewPin}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                  >
                    Guardar Nuevo NIP
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <header className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenImageEdit}
              className="focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-lg transition-transform hover:scale-105"
              title="Cambiar logo"
            >
              {config.imageUrl ? (
                <img
                  src={config.imageUrl}
                  alt={config.name}
                  className="w-12 h-12 object-contain rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="text-orange-600" size={24} />
                </div>
              )}
            </button>
            <button
              onClick={handleOpenNameEdit}
              className="text-2xl md:text-2xl text-lg font-bold text-gray-800 hover:text-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-lg px-2"
              title="Cambiar nombre"
            >
              {config.name}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenMenuSettings}
              className="hidden md:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
              title="Gestionar menú"
            >
              <ListOrdered className="text-orange-600" size={20} />
              <span className="font-medium text-orange-800">
                {menuItems.length}
              </span>
            </button>
            
            <button
              onClick={handleOpenMenuSettings}
              className="md:hidden p-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              title="Gestionar menú"
            >
              <ListOrdered className="text-orange-600" size={20} />
            </button>
            
            <button
              onClick={handleToggleNip}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                config.nipEnabled
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 shadow-sm'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              title={config.nipEnabled ? "NIP Activado - Click para desactivar" : "NIP Desactivado - Click para activar"}
            >
              {config.nipEnabled ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="relative hidden md:inline">
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    NIP
                  </span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span className="hidden md:inline line-through">NIP</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleOpenSettings}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
              title="Configuración"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Name Edit Modal */}
      {showNameEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Cambiar Nombre del Negocio</h2>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={tempConfig.name}
                onChange={(e) => setTempConfig({ ...tempConfig, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Nombre del negocio"
                autoFocus
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <button
                onClick={() => setShowNameEdit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Edit Modal */}
      <SettingsModal
        isOpen={showImageEdit}
        onClose={() => setShowImageEdit(false)}
        currentConfig={tempConfig}
        onConfigUpdate={(newConfig) => {
          setTempConfig(newConfig);
          setConfig(newConfig);
          setShowImageEdit(false);
        }}
        showNameField={false}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          refreshMenu();
        }}
        currentConfig={config}
        onConfigUpdate={(newConfig) => {
          setConfig(newConfig);
          refreshMenu();
        }}
        activeTab={activeSettingsTab}
      />

      {/* Modal de NIP */}
      {renderNipModal()}
    </header>
  );
}