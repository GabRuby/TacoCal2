import React, { useEffect } from 'react';
import { ImageUpload } from './ImageUpload';
import { BusinessConfig, defaultConfig } from '../../types/index';

interface SettingsFormProps {
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
  error?: string;
  showNameField?: boolean;
}

export function SettingsForm({ config, onConfigChange, error, showNameField = true }: SettingsFormProps) {
  // Efecto para asegurar que los valores por defecto se apliquen correctamente
  useEffect(() => {
    const mergedConfig = {
      ...defaultConfig,
      ...config,
    };
    onConfigChange(mergedConfig);
  }, []);

  return (
    <div className="space-y-6">
      {showNameField && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Negocio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.name || defaultConfig.name}
            onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              error && !config.name?.trim() ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre del negocio"
          />
        </div>
      )}

      {/* Campo para Título del Reporte PDF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título del Reporte PDF
        </label>
        <input
          type="text"
          value={config.reportTitle || defaultConfig.reportTitle || ''}
          onChange={(e) => onConfigChange({ ...config, reportTitle: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Ej: Reporte de Ventas Diarias"
        />
        <p className="mt-1 text-sm text-gray-500">
          Este será el título principal en el reporte PDF.
        </p>
      </div>

      {/* Campo para Nombre del Archivo de Excel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Archivo de Excel
        </label>
        <input
          type="text"
          value={config.excelFileName || defaultConfig.excelFileName || ''}
          onChange={(e) => onConfigChange({ ...config, excelFileName: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Ej: Reporte_Ventas"
        />
        <p className="mt-1 text-sm text-gray-500">
          Este será el nombre base del archivo al exportar a Excel (se añadirá la fecha).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo del Negocio
        </label>
        <div className="mb-2">
          <ImageUpload
            imageUrl={config.imageUrl || defaultConfig.imageUrl}
            onImageChange={(base64) => onConfigChange({ ...config, imageUrl: base64 })}
            onImageRemove={() => onConfigChange({ ...config, imageUrl: defaultConfig.imageUrl })}
            aspectRatio="1/1"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Formatos permitidos: JPG, PNG, GIF. La imagen se ajustará automáticamente al tamaño requerido.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagen de Fondo
        </label>
        <div className="mb-2">
          <ImageUpload
            imageUrl={config.backgroundUrl || defaultConfig.backgroundUrl}
            onImageChange={(base64) => onConfigChange({ ...config, backgroundUrl: base64 })}
            onImageRemove={() => onConfigChange({ ...config, backgroundUrl: defaultConfig.backgroundUrl })}
            aspectRatio="16/9"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Formatos permitidos: JPG, PNG, GIF. La imagen se ajustará automáticamente al tamaño requerido.
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}