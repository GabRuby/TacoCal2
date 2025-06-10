// src/components/SecuritySettingsForm.tsx
import React, { useState } from 'react';
import { BusinessConfig } from '../../types'; // Ajusta la ruta si es necesario
import { AlertTriangle } from 'lucide-react';

interface SecuritySettingsFormProps {
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
}

type SecurityView = 'auth' | 'main' | 'changePin' | 'changeRecovery' | 'inaccessible' | 'recovery' | 'recoveryNewPin';

export function SecuritySettingsForm({ config, onConfigChange }: SecuritySettingsFormProps) {
  const [view, setView] = useState<SecurityView>(config.adminPin ? 'auth' : 'main');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [localPin, setLocalPin] = useState(''); // Estado local para el NIP
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const handleAuthSubmit = () => {
    if (authPin === config.adminPin) {
      setIsAuthenticated(true);
      setView('main');
      setAuthError('');
    } else {
      setAuthError('NIP incorrecto');
    }
  };

  const handleCancelAuth = () => {
    setView('inaccessible');
    setIsAuthenticated(false);
    setAuthPin('');
    setAuthError('');
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPin = e.target.value;
    setLocalPin(newPin); // Actualizar el estado local
    onConfigChange({ ...config, adminPin: newPin });
    // Clear error if pin is now empty or matches confirm
    if (newPin === pinConfirm || !newPin) {
      setPinError('');
    }
  };

  const handlePinConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPinConfirm = e.target.value;
    setPinConfirm(newPinConfirm);
    if (localPin !== newPinConfirm) { // Usar localPin en lugar de config.adminPin
      setPinError('Los NIPs no coinciden.');
    } else {
      setPinError('');
    }
  };

  const handleSavePin = () => {
    if (localPin && localPin === pinConfirm) {
      onConfigChange({ ...config, adminPin: localPin });
      setView('main');
      setLocalPin('');
      setPinConfirm('');
      setPinError('');
    } else {
      setPinError('Por favor, ingresa y confirma el NIP correctamente');
    }
  };

  // Basic validation for recovery answer
  const handleRecoveryAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value;
    onConfigChange({ ...config, recoveryAnswer: answer });
  };

  const handleSaveRecovery = () => {
    if (config.recoveryQuestion && config.recoveryAnswer) {
      setView('main');
    }
  };

  const handleRecoverySubmit = () => {
    if (!config.recoveryQuestion || !config.recoveryAnswer) {
      setRecoveryError('No hay pregunta de recuperación configurada');
      return;
    }

    if (recoveryAnswer.toLowerCase().trim() === config.recoveryAnswer.toLowerCase().trim()) {
      setView('recoveryNewPin');
      setRecoveryError('');
    } else {
      setRecoveryError('Respuesta incorrecta');
    }
  };

  const handleRecoveryNewPin = () => {
    if (localPin && localPin === pinConfirm) {
      onConfigChange({ ...config, adminPin: localPin });
      setView('main');
      setIsAuthenticated(true);
      setLocalPin('');
      setPinConfirm('');
      setPinError('');
      setRecoveryAnswer('');
    } else {
      setPinError('Por favor, ingresa y confirma el NIP correctamente');
    }
  };

  // Vista de autenticación
  if (view === 'auth') {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="authPin" className="block text-sm font-medium text-gray-700 mb-1">
            Ingresa tu NIP de Administrador
          </label>
          <input
            type="password"
            id="authPin"
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
                onClick={() => setView('recovery')}
                className="text-sm text-orange-600 hover:text-orange-700 mt-1"
              >
                ¿Olvidaste tu NIP?
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancelAuth}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleAuthSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
          >
            Aceptar
          </button>
        </div>
      </div>
    );
  }

  // Vista de información inaccesible
  if (view === 'inaccessible') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Información Inaccesible</h3>
        <p className="text-gray-600 text-center mb-4">
          Se requiere autenticación para acceder a la configuración de seguridad.
        </p>
        <button
          onClick={() => setView('auth')}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
        >
          Intentar Nuevamente
        </button>
      </div>
    );
  }

  // Vista principal (después de autenticación o sin NIP)
  if (view === 'main' && (isAuthenticated || !config.adminPin)) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Configuración de Seguridad</h3>
      
        {!config.adminPin ? (
          // Vista inicial para establecer NIP
          <>
      <div>
        <label htmlFor="adminPin" className="block text-sm font-medium text-gray-700 mb-1">
          NIP de Administrador
        </label>
        <input
                type="password"
          id="adminPin"
                value={localPin}
          onChange={handlePinChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Establece un NIP de 4-6 dígitos"
          maxLength={6}
        />
      </div>

      <div>
        <label htmlFor="adminPinConfirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar NIP
        </label>
        <input
          type="password"
          id="adminPinConfirm"
          value={pinConfirm}
          onChange={handlePinConfirmChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            pinError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
          }`}
          placeholder="Confirma tu NIP"
          maxLength={6}
        />
        {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
      </div>

      <div>
        <label htmlFor="recoveryQuestion" className="block text-sm font-medium text-gray-700 mb-1">
          Pregunta de Recuperación
        </label>
        <input
          type="text"
          id="recoveryQuestion"
          value={config.recoveryQuestion || ''}
          onChange={(e) => onConfigChange({ ...config, recoveryQuestion: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Ej: ¿Cuál fue el nombre de tu primera mascota?"
        />
      </div>

      <div>
        <label htmlFor="recoveryAnswer" className="block text-sm font-medium text-gray-700 mb-1">
          Respuesta de Recuperación
        </label>
        <input
          type="text"
          id="recoveryAnswer"
          value={config.recoveryAnswer || ''}
          onChange={handleRecoveryAnswerChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Tu respuesta secreta"
        />
            </div>
          </>
        ) : (
          // Vista con NIP establecido (solo visible si está autenticado)
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setView('changePin')}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
              >
                Modificar NIP
              </button>
              <button
                onClick={() => setView('changeRecovery')}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
              >
                Modificar Pregunta Secreta
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              La pregunta secreta te ayudará a recuperar tu NIP en caso de olvidarlo.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Vista para modificar NIP
  if (view === 'changePin') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Modificar NIP de Administrador</h3>
        
        <div>
          <label htmlFor="adminPin" className="block text-sm font-medium text-gray-700 mb-1">
            Nuevo NIP
          </label>
          <input
            type="password"
            id="adminPin"
            value={localPin}
            onChange={handlePinChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Establece un NIP de 4-6 dígitos"
            maxLength={6}
          />
        </div>

        <div>
          <label htmlFor="adminPinConfirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Nuevo NIP
          </label>
          <input
            type="password"
            id="adminPinConfirm"
            value={pinConfirm}
            onChange={handlePinConfirmChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              pinError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
            }`}
            placeholder="Confirma tu NIP"
            maxLength={6}
          />
          {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setView('main')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSavePin}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  // Vista para modificar pregunta secreta
  if (view === 'changeRecovery') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Modificar Pregunta de Recuperación</h3>
        
        <div>
          <label htmlFor="recoveryQuestion" className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Pregunta de Recuperación
          </label>
          <input
            type="text"
            id="recoveryQuestion"
            value={config.recoveryQuestion || ''}
            onChange={(e) => onConfigChange({ ...config, recoveryQuestion: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Ej: ¿Cuál fue el nombre de tu primera mascota?"
          />
        </div>

        <div>
          <label htmlFor="recoveryAnswer" className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Respuesta de Recuperación
          </label>
          <input
            type="text"
            id="recoveryAnswer"
            value={config.recoveryAnswer || ''}
            onChange={handleRecoveryAnswerChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Tu respuesta secreta"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setView('main')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveRecovery}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  // Vista de recuperación de NIP
  if (view === 'recovery') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Recuperar NIP</h3>
        
        {!config.recoveryQuestion ? (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-red-600">No hay pregunta de recuperación configurada.</p>
            <button
              onClick={() => setView('auth')}
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

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setView('auth')}
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
    );
  }

  // Vista para establecer nuevo NIP después de recuperación exitosa
  if (view === 'recoveryNewPin') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Establecer Nuevo NIP</h3>
        
        <div>
          <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
            Nuevo NIP
          </label>
          <input
            type="password"
            id="newPin"
            value={localPin}
            onChange={handlePinChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Establece un NIP de 4-6 dígitos"
            maxLength={6}
          />
        </div>

        <div>
          <label htmlFor="newPinConfirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Nuevo NIP
          </label>
          <input
            type="password"
            id="newPinConfirm"
            value={pinConfirm}
            onChange={handlePinConfirmChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              pinError ? 'border-red-500 ring-red-300' : 'focus:ring-orange-300'
            }`}
            placeholder="Confirma tu NIP"
            maxLength={6}
          />
          {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setView('recovery')}
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
  );
  }

  return null;
}