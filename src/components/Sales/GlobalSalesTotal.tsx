import React, { useState, useRef, useEffect } from 'react';
import { DollarSign, ChevronUp, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { getDailySalesReport, importDailySales, exportDailySales } from '../../utils/dailySales';
import { DailySalesActions } from './DailySalesActions';
import { useConfig } from '../../contexts/ConfigContext';
import { useDailySales } from '../../contexts/DailySalesContext';
import { formatQuantity } from '../../utils/numberFormat';

type NipView = 'auth' | 'recovery' | 'recoveryNewPin';

export function GlobalSalesTotal() {
  const [showDetails, setShowDetails] = useState(false);
  const { config: currentConfig, setConfig } = useConfig();
  
  // Estados para el manejo del NIP
  const [showNipAuth, setShowNipAuth] = useState(false);
  const [nipView, setNipView] = useState<NipView>('auth');
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Recuperamos el estado de la visibilidad desde localStorage o lo establecemos en true por defecto.
  const storedShowAmount = localStorage.getItem('showAmount');
  const [showAmount, setShowAmount] = useState(storedShowAmount ? JSON.parse(storedShowAmount) : true);

  const [, forceUpdate] = useState({});
  const { dailySales, refreshDailySales } = useDailySales();
  const { total, products } = dailySales;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    refreshDailySales();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importDailySales(content);
        refreshDailySales();
      } catch (error) {
        alert('Error al importar las ventas. Verifica que el archivo sea válido.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleExport = () => {
    exportDailySales();
  };

  const handleShowAmountToggle = () => {
    if (!showAmount && currentConfig.nipEnabled) {
      // Si intentamos mostrar el monto y el NIP está activado, solicitamos autenticación
      setShowNipAuth(true);
      setNipView('auth');
      setAuthPin('');
      setAuthError('');
    } else {
      // Si el NIP está desactivado o estamos ocultando el monto, procedemos normalmente
      const newShowAmount = !showAmount;
      setShowAmount(newShowAmount);
      localStorage.setItem('showAmount', JSON.stringify(newShowAmount));
    }
  };

  const handleNipAuth = () => {
    if (authPin === currentConfig.adminPin) {
      const newShowAmount = true;
      setShowAmount(newShowAmount);
      localStorage.setItem('showAmount', JSON.stringify(newShowAmount));
      setShowNipAuth(false);
      setAuthPin('');
      setAuthError('');
      setNipView('auth');
    } else {
      setAuthError('NIP incorrecto');
    }
  };

  const handleRecoverySubmit = () => {
    if (!currentConfig.recoveryQuestion || !currentConfig.recoveryAnswer) {
      setRecoveryError('No hay pregunta de recuperación configurada');
      return;
    }

    if (recoveryAnswer.toLowerCase().trim() === currentConfig.recoveryAnswer.toLowerCase().trim()) {
      setNipView('recoveryNewPin');
      setRecoveryError('');
    } else {
      setRecoveryError('Respuesta incorrecta');
    }
  };

  const handleRecoveryNewPin = () => {
    if (newPin && newPin === newPinConfirm) {
      setConfig({ ...currentConfig, adminPin: newPin });
      const newShowAmount = true;
      setShowAmount(newShowAmount);
      localStorage.setItem('showAmount', JSON.stringify(newShowAmount));
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
                  Se requiere el NIP de administrador para ver el total del día.
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
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setShowNipAuth(false);
                      setAuthPin('');
                      setAuthError('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
                {!currentConfig.recoveryQuestion ? (
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
                    <p className="text-sm text-gray-600 mb-4">{currentConfig.recoveryQuestion}</p>
                    <input
                      type="text"
                      value={recoveryAnswer}
                      onChange={(e) => setRecoveryAnswer(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        recoveryError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
                      }`}
                      placeholder="Tu respuesta"
                    />
                    {recoveryError && (
                      <p className="mt-2 text-red-500 text-xs">{recoveryError}</p>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setNipView('auth')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Volver
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nuevo NIP
                    </label>
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        pinError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
                      }`}
                      placeholder="Ingresa el nuevo NIP"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar NIP
                    </label>
                    <input
                      type="password"
                      value={newPinConfirm}
                      onChange={(e) => setNewPinConfirm(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        pinError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
                      }`}
                      placeholder="Confirma el nuevo NIP"
                      maxLength={6}
                    />
                  </div>
                  {pinError && (
                    <p className="text-red-500 text-xs">{pinError}</p>
                  )}
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="max-w-7xl mx-auto">
        {showDetails && (
          <div className="px-4 py-3 border-b bg-orange-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-800">Resumen de Productos:</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                  title="Importar ventas"
                >
                  <Upload size={16} />
                  Imp
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                  title="Exportar ventas"
                >
                  <Download size={16} />
                  Exp
                </button>
                <DailySalesActions onReset={handleReset} />
              </div>
            </div>
            <div className="grid gap-2">
              {products.map(product => (
                <div key={product.id} className="flex justify-between text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-700">{product.name}</span>
                    <span className="text-gray-500">x {formatQuantity(product.quantity)}</span>
                  </div>
                  <span className="font-medium">${product.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronUp
                className={`text-gray-600 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                size={24}
              />
            </button>
            <DollarSign className="text-orange-600" size={24} />
            <span className="font-medium text-gray-700">Total del Día:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShowAmountToggle}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={showAmount ? 'Ocultar monto' : 'Mostrar monto'}
            >
              {showAmount ? (
                <EyeOff className="text-gray-600" size={20} />
              ) : (
                <Eye className="text-gray-600" size={20} />
              )}
            </button>
            <span className="text-2xl font-bold text-orange-600">
              {showAmount ? `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '****'}
            </span>
          </div>
        </div>
      </div>
      {renderNipModal()}
    </div>
  );
}
