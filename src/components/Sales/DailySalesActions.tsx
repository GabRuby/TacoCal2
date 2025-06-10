import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Download, Settings } from 'lucide-react';
import { generateNewDailyReport } from '../../utils/newReport';
import { exportDailyReportToExcel } from '../../utils/reports';
import { clearDailySales, getDailySalesReport } from '../../utils/dailySales';
import { getConfig } from '../../utils/config';
import { getMenu } from '../../utils/menu';
import { WorkingHours } from '../../types';
import { useConfig } from '../../contexts/ConfigContext';

interface DailySalesActionsProps {
  onReset: () => void;
}

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
type NipView = 'auth' | 'recovery' | 'recoveryNewPin';
type ReportType = 'all' | 'topN' | 'top6profitable';

interface ReportConfig {
  type: ReportType;
  nProducts?: number; // Solo usado cuando type es 'topN'
}

export function DailySalesActions({ onReset }: DailySalesActionsProps) {
  const [nextResetInfo, setNextResetInfo] = useState<{ date: string; time: string }>({ date: '', time: '' });
  const [reportConfig, setReportConfig] = useState<ReportConfig>({ type: 'all' });
  const [showReportModal, setShowReportModal] = useState(false);
  const { date } = getDailySalesReport();
  const config = getConfig();
  const { config: currentConfig, setConfig } = useConfig();
  const [showNipAuth, setShowNipAuth] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [nipView, setNipView] = useState<NipView>('auth');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  
  const totalMenuItems = getMenu().length;
  const maxNProducts = Math.max(1, totalMenuItems - 1);

  useEffect(() => {
    const calculateNextReset = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayName = days[currentDay];
      
      // Encontrar el próximo día laboral
      let nextWorkingDay = currentDayName;
      let daysToAdd = 0;
      
      // Buscar el próximo día laboral (que no esté cerrado)
      do {
        const workingHours = config.workingHours.find(wh => wh.day === nextWorkingDay);
        if (workingHours && !workingHours.isClosed) {
          break;
        }
        daysToAdd++;
        nextWorkingDay = days[(currentDay + daysToAdd) % 7];
      } while (daysToAdd < 7);

      // Si no se encontró ningún día laboral en la próxima semana, usar el día actual
      if (daysToAdd === 7) {
        nextWorkingDay = currentDayName;
        daysToAdd = 0;
      }

      const workingHours = config.workingHours.find(wh => wh.day === nextWorkingDay);
      if (!workingHours) return;

      // Crear fecha del próximo reinicio (1 minuto antes de la hora de apertura)
      const nextReset = new Date(now);
      nextReset.setDate(now.getDate() + daysToAdd);
      
      const [hours, minutes] = workingHours.openTime.split(':').map(Number);
      nextReset.setHours(hours, minutes - 1, 0, 0); // 1 minuto antes de la hora de apertura

      // Si la hora calculada ya pasó hoy, buscar el siguiente día
      if (nextReset <= now) {
        nextReset.setDate(nextReset.getDate() + 1);
        // Buscar el siguiente día laboral
        let nextDay = days[(nextReset.getDay() + 1) % 7];
        let additionalDays = 1;
        while (additionalDays < 7) {
          const wh = config.workingHours.find(w => w.day === nextDay);
          if (wh && !wh.isClosed) {
            const [h, m] = wh.openTime.split(':').map(Number);
            nextReset.setDate(nextReset.getDate() + additionalDays);
            nextReset.setHours(h, m - 1, 0, 0);
            break;
          }
          nextDay = days[(nextReset.getDay() + 1) % 7];
          additionalDays++;
        }
      }

      // Formatear la fecha y hora para el tooltip
      const dateStr = nextReset.toLocaleDateString('es-MX', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = nextReset.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      setNextResetInfo({ date: dateStr, time: timeStr });
    };

    calculateNextReset();
    const interval = setInterval(calculateNextReset, 60000); // Actualizar cada minuto
    
    return () => clearInterval(interval);
  }, [config.workingHours]);

  const handleReset = () => {
    const confirmationMessage = `La próxima hora para reinicio automático es el ${nextResetInfo.date} a las ${nextResetInfo.time}.\n\n¿Deseas reiniciar el contador del día ahora? Esta acción no se puede deshacer.`;

    if (confirm(confirmationMessage)) {
      if (currentConfig.nipEnabled) {
        setShowNipAuth(true);
        setNipView('auth');
        setAuthPin('');
        setAuthError('');
      } else {
        clearDailySales();
        onReset();
      }
    }
  };

  const handleNipAuth = () => {
    if (authPin === currentConfig.adminPin) {
      if (confirm('¿Estás seguro de reiniciar el contador del día? Esta acción no se puede deshacer.')) {
        clearDailySales();
        onReset();
        setShowNipAuth(false);
        setAuthPin('');
        setAuthError('');
        setNipView('auth');
      }
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
      // Actualizar el NIP en la configuración
      setConfig({ ...currentConfig, adminPin: newPin });
      if (confirm('¿Estás seguro de reiniciar el contador del día? Esta acción no se puede deshacer.')) {
        clearDailySales();
        onReset();
        setShowNipAuth(false);
        setNewPin('');
        setNewPinConfirm('');
        setPinError('');
        setNipView('auth');
      }
    } else {
      setPinError('Por favor, ingresa y confirma el NIP correctamente');
    }
  };

  const resetTooltip = `Reiniciar contador del día\nPróximo reinicio automático: ${nextResetInfo.date} a las ${nextResetInfo.time}`;

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
                  Se requiere el NIP de administrador para reiniciar el contador del día.
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pregunta de Recuperación
                      </label>
                      <p className="text-gray-600 mb-4">{currentConfig.recoveryQuestion}</p>
                      
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

  const handleGeneratePdf = async () => {
    const config = await getConfig();
    if (config) {
      generateNewDailyReport(config, reportConfig);
    }
  };

  const handleExportExcel = () => {
    const config = getConfig();
    if (config) {
      exportDailyReportToExcel(config);
    }
  };

  const renderReportModal = () => {
    if (!showReportModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Configurar Reporte</h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={reportConfig.type === 'all'}
                  onChange={() => setReportConfig({ type: 'all' })}
                  className="text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <div className="flex-1">
                  <span className="block font-medium">Todos los productos</span>
                  <span className="block text-sm text-gray-500">Muestra todos los productos vendidos</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={reportConfig.type === 'topN'}
                  onChange={() => setReportConfig({ type: 'topN', nProducts: reportConfig.nProducts || maxNProducts })}
                  className="text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Top</span>
                    <input
                      type="number"
                      min="1"
                      max={maxNProducts}
                      value={reportConfig.nProducts || maxNProducts}
                      onChange={(e) => setReportConfig({ 
                        type: 'topN', 
                        nProducts: Math.min(maxNProducts, Math.max(1, parseInt(e.target.value) || 1)) 
                      })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={reportConfig.type !== 'topN'}
                    />
                    <span className="font-medium">productos + Otros</span>
                  </div>
                  <span className="block text-sm text-gray-500 mt-1">Muestra los N productos más vendidos y agrupa el resto</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={reportConfig.type === 'top6profitable'}
                  onChange={() => setReportConfig({ type: 'top6profitable' })}
                  className="text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <div className="flex-1">
                  <span className="block font-medium">6 productos más rentables</span>
                  <span className="block text-sm text-gray-500">Muestra los 6 productos con mayor rentabilidad</span>
                </div>
              </label>
            </div>

            <div className="flex flex-col space-y-2 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  handleGeneratePdf();
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Generar Reporte
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap items-center">
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          title="Generar reporte"
        >
          <Printer size={16} />
        </button>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          title="Exportar reporte a Excel"
        >
          <Download size={16} />
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {renderReportModal()}
      {renderNipModal()}
    </>
  );
}