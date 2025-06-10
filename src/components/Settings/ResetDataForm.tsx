import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  UtensilsCrossed, 
  Home, 
  Clock, 
  Lock, 
  DollarSign,
  AlertTriangle,
  CheckSquare,
  Square,
  LucideIcon,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import { resetGeneralSection, resetMenuSection, resetBankSection, saveResetConfig } from '../../utils/resetData';
import { defaultConfig } from '../../types/index';
import { defaultMenuItems } from '../../data/menuItems';
import { useMenu } from '../../contexts/MenuContext';

interface ResetSection {
  id: 'general' | 'menu' | 'bank' | 'currencyAndTime' | 'security' | 'sales';
  name: string;
  description: string;
  items: string[];
  warning?: string;
  requiresExtraConfirmation?: boolean;
  icon: LucideIcon;
}

const resetSections: ResetSection[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Configuración general del negocio',
    items: [
      'Nombre del Negocio',
      'Nombre del archivo PDF',
      'Logo del Negocio',
      'Imagen de Fondo'
    ],
    icon: Settings
  },
  {
    id: 'menu',
    name: 'Menú',
    description: 'Registros del menú',
    items: [
      'Todos los registros del menú'
    ],
    warning: 'El menú quedará vacío y será necesario agregar productos para que la calculadora funcione',
    icon: UtensilsCrossed
  },
  {
    id: 'bank',
    name: 'Banco',
    description: 'Datos bancarios',
    items: [
      'Todos los datos bancarios'
    ],
    icon: Home
  },
  {
    id: 'currencyAndTime',
    name: 'Moneda y Horario',
    description: 'Configuración de moneda y horarios',
    items: [
      'Restaurar a Peso Mexicano',
      'Marcar todos los días como cerrados'
    ],
    icon: Clock
  },
  {
    id: 'security',
    name: 'Seguridad',
    description: 'Configuración de seguridad',
    items: [
      'NIP de administrador',
      'Pregunta y respuesta de recuperación'
    ],
    requiresExtraConfirmation: true,
    icon: Lock
  },
  {
    id: 'sales',
    name: 'Ventas',
    description: 'Registros de ventas',
    items: [
      'Historial de ventas',
      'Reportes generados',
      'Contador del día'
    ],
    icon: DollarSign
  }
];

interface ResetDataFormProps {
  onClose: () => void;
}

export function ResetDataForm({ onClose }: ResetDataFormProps) {
  const { config, setConfig } = useConfig();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { menuItems, clearMenuItems, refreshMenu } = useMenu();

  // Verificar si hay datos que reiniciar en cada sección
  const hasGeneralDataToReset = useMemo(() => {
    return (
      config.name !== defaultConfig.name ||
      config.reportTitle !== defaultConfig.reportTitle ||
      config.excelFileName !== defaultConfig.excelFileName ||
      config.imageUrl !== defaultConfig.imageUrl ||
      config.backgroundUrl !== defaultConfig.backgroundUrl
    );
  }, [config]);

  const hasMenuDataToReset = useMemo(() => {
    return menuItems.length > 0;
  }, [menuItems]);

  const hasBankDataToReset = useMemo(() => {
    return (
      (config.bankName && config.bankName !== defaultConfig.bankName) ||
      (config.bankBeneficiary && config.bankBeneficiary !== defaultConfig.bankBeneficiary) ||
      (config.accountNumber && config.accountNumber !== defaultConfig.accountNumber) ||
      (config.clabe && config.clabe !== defaultConfig.clabe)
    );
  }, [config]);

  // Función para manejar la selección de secciones
  const toggleSection = (section: string) => {
    if (section === 'general' && !hasGeneralDataToReset) return;
    if (section === 'menu' && !hasMenuDataToReset) return;
    if (section === 'bank' && !hasBankDataToReset) return;
    
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Función para manejar la selección de todas las secciones
  const toggleAllSections = () => {
    const availableSections = [
      ...(hasGeneralDataToReset ? ['general'] : []),
      ...(hasMenuDataToReset ? ['menu'] : []),
      ...(hasBankDataToReset ? ['bank'] : [])
    ];

    setSelectedSections(prev =>
      prev.length === availableSections.length
        ? []
        : availableSections
    );
  };

  const handleReset = async () => {
    if (selectedSections.length === 0) {
      setError('Por favor, selecciona al menos una sección para reiniciar');
      return;
    }

    setIsResetting(true);
    setError(null);
    setSuccess(null);

    try {
      let newConfig = { ...config };

      // Reiniciar secciones seleccionadas
      if (selectedSections.includes('general')) {
        newConfig = resetGeneralSection(config);
      }
      if (selectedSections.includes('menu')) {
        clearMenuItems();
        refreshMenu(); // Actualizar el menú después de limpiarlo
      }
      if (selectedSections.includes('bank')) {
        newConfig = resetBankSection(newConfig);
      }

      // Guardar la configuración reiniciada
      await saveResetConfig(newConfig);
      setConfig(newConfig); // Actualizar el contexto de configuración

      setSuccess('Las secciones seleccionadas han sido reiniciadas correctamente');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Ocurrió un error al reiniciar las secciones');
      console.error('Error al reiniciar:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con advertencia */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Advertencia: Reinicio de Datos
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Selecciona las secciones que deseas reiniciar. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de todas las secciones */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <button
          onClick={toggleAllSections}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          {selectedSections.length === (hasGeneralDataToReset && hasMenuDataToReset && hasBankDataToReset ? 3 : 1)
            ? <CheckSquare size={20} className="text-orange-600" />
            : <Square size={20} className="text-gray-400" />}
          <span className="font-medium">Seleccionar todas las secciones</span>
        </button>
      </div>

      {/* Lista de secciones */}
      <div className="space-y-3">
        {resetSections.map((section) => {
          const isSelected = selectedSections.includes(section.id);
          const isDisabled = 
            (section.id === 'general' && !hasGeneralDataToReset) ||
            (section.id === 'menu' && !hasMenuDataToReset) ||
            (section.id === 'bank' && !hasBankDataToReset);

          return (
            <div
              key={section.id}
              className={`
                p-4 rounded-lg border
                ${isSelected ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-orange-200'}
              `}
              onClick={() => !isDisabled && toggleSection(section.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {isSelected ? (
                    <CheckSquare size={20} className="text-orange-600" />
                  ) : (
                    <Square size={20} className={isDisabled ? "text-gray-300" : "text-gray-400"} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <section.icon size={20} className={isSelected ? "text-orange-600" : "text-gray-500"} />
                    <h3 className={`font-medium ${isSelected ? "text-orange-900" : "text-gray-900"}`}>
                      {section.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                  {section.items.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                      {section.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {isDisabled && section.id === 'bank' && (
                    <p className="mt-2 text-sm text-gray-500">
                      No hay datos bancarios para reiniciar
                    </p>
                  )}
                  {section.warning && isSelected && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      <AlertTriangle size={16} className="inline mr-1" />
                      {section.warning}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onClose}
          disabled={isResetting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleReset}
          disabled={selectedSections.length === 0 || isResetting}
          className={`
            px-4 py-2 text-sm font-medium text-white rounded-md
            ${selectedSections.length === 0 || isResetting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
            }
          `}
        >
          {isResetting ? 'Reiniciando...' : 'Reiniciar Secciones Seleccionadas'}
        </button>
      </div>
    </div>
  );
} 