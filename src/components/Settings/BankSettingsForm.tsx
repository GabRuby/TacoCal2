// src/components/BankSettingsForm.tsx
import React, { useState } from 'react';
import { BusinessConfig } from '../../types';
import { AlertCircle, Info } from 'lucide-react';

interface BankSettingsFormProps {
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
}

export function BankSettingsForm({ config, onConfigChange }: BankSettingsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'bankName':
        if (!value.trim()) {
          return 'El nombre del banco es requerido';
        }
        break;
      case 'bankBeneficiary':
        if (!value.trim()) {
          return 'El nombre del beneficiario es requerido';
        }
        break;
      case 'accountNumber':
        if (!value.trim()) {
          return 'El número de tarjeta es requerido';
        }
        if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
          return 'El número de tarjeta debe tener 16 dígitos';
        }
        break;
      case 'clabe':
        if (value.trim() && !/^\d{18}$/.test(value.replace(/\s/g, ''))) {
          return 'La CLABE debe tener 18 dígitos';
        }
        break;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear el número de tarjeta con espacios cada 4 dígitos
    if (name === 'accountNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Formatear la CLABE con espacios cada 4 dígitos
    if (name === 'clabe') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    const error = validateField(name, formattedValue);
    setErrors(prev => ({ ...prev, [name]: error }));

    onConfigChange({ ...config, [name]: formattedValue });
  };

  return (
    <div className="space-y-6">
      {/* Mensaje informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Información Bancaria
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Esta información se utilizará para mostrar los datos de pago en los reportes y recibos.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Banco *
        </label>
        <input
          type="text"
          id="bankName"
          name="bankName"
          value={config.bankName || ''}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 ${
            errors.bankName ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Ej: BBVA, Santander, Citibanamex"
        />
        {errors.bankName && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.bankName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bankBeneficiary" className="block text-sm font-medium text-gray-700 mb-1">
          Beneficiario de la Cuenta *
        </label>
        <input
          type="text"
          id="bankBeneficiary"
          name="bankBeneficiary"
          value={config.bankBeneficiary || ''}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 ${
            errors.bankBeneficiary ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Nombre completo o razón social del titular"
        />
        {errors.bankBeneficiary && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.bankBeneficiary}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Número de Tarjeta *
        </label>
        <input
          type="text"
          id="accountNumber"
          name="accountNumber"
          value={config.accountNumber || ''}
          onChange={handleChange}
          maxLength={19} // 16 dígitos + 3 espacios
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 ${
            errors.accountNumber ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="1234 5678 9012 3456"
        />
        {errors.accountNumber && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.accountNumber}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Ingresa el número de tarjeta sin espacios, se formateará automáticamente
        </p>
      </div>

      <div>
        <label htmlFor="clabe" className="block text-sm font-medium text-gray-700 mb-1">
          CLABE Interbancaria
        </label>
        <input
          type="text"
          id="clabe"
          name="clabe"
          value={config.clabe || ''}
          onChange={handleChange}
          maxLength={22} // 18 dígitos + 4 espacios
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 ${
            errors.clabe ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="1234 5678 9012 3456 7890 (opcional)"
        />
        {errors.clabe && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.clabe}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Clave Bancaria Estandarizada a 18 dígitos para transferencias interbancarias en México (opcional)
        </p>
      </div>
    </div>
  );
}