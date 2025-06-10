// src/components/CurrencyTimeSettingsForm.tsx
import React from 'react';
import { BusinessConfig, WorkingHours, CURRENCIES } from '../../types'; // Ajusta la ruta si es necesario

interface CurrencyTimeSettingsFormProps {
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
}

const dayNames = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export function CurrencyTimeSettingsForm({ config, onConfigChange }: CurrencyTimeSettingsFormProps) {
  const handleWorkingHoursChange = (day: string, field: keyof WorkingHours, value: string | boolean) => {
    const updatedWorkingHours = config.workingHours.map(wh => {
      if (wh.day === day) {
        return { ...wh, [field]: value };
      }
      return wh;
    });
    onConfigChange({ ...config, workingHours: updatedWorkingHours });
  };

  return (
    <div className="space-y-6">
      {/* Configuración de Moneda */}
      <div>
        <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 mb-1">
          Moneda
        </label>
        <select
          id="currencyCode"
          value={config.currencyCode}
          onChange={(e) => onConfigChange({ ...config, currencyCode: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Configuración de Zona Horaria - MODIFICADO */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zona Horaria Detectada
        </label>
        <p className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-800">
          {config.timeZone || 'No detectada'} {/* Muestra la zona horaria detectada */}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          La aplicación usa la zona horaria de tu dispositivo para gestionar los horarios de operación.
        </p>
      </div>

      {/* Configuración de Horario de Trabajo */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Horario de Jornada Laboral por Día</h4>
        <div className="space-y-4">
          {config.workingHours.map((wh) => (
            <div key={wh.day} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center border rounded-md bg-gray-50">
              <span className="font-medium text-gray-800 col-span-1 md:col-span-1">{dayNames[wh.day]}</span>

              <div className="flex items-center gap-2 col-span-1 md:col-span-1">
                <input
                  type="checkbox"
                  id={`isClosed-${wh.day}`}
                  checked={wh.isClosed}
                  onChange={(e) => handleWorkingHoursChange(wh.day, 'isClosed', e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-300"
                />
                <label htmlFor={`isClosed-${wh.day}`} className="text-sm text-gray-700">Cerrado</label>
              </div>

              {!wh.isClosed && (
                <>
                  <div className="col-span-1 md:col-span-1">
                    <label htmlFor={`openTime-${wh.day}`} className="block text-xs font-medium text-gray-600 mb-1">Apertura</label>
                    <input
                      type="time"
                      id={`openTime-${wh.day}`}
                      value={wh.openTime}
                      onChange={(e) => handleWorkingHoursChange(wh.day, 'openTime', e.target.value)}
                      className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label htmlFor={`closeTime-${wh.day}`} className="block text-xs font-medium text-gray-600 mb-1">Cierre</label>
                    <input
                      type="time"
                      id={`closeTime-${wh.day}`}
                      value={wh.closeTime}
                      onChange={(e) => handleWorkingHoursChange(wh.day, 'closeTime', e.target.value)}
                      className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}