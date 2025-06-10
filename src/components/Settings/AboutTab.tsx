import React from 'react';

export function AboutTab() {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4"> {/* Scroll para Acerca de */}
      <p className="text-sm text-gray-700 mb-2">
        CalcTac es una aplicación de punto de venta diseñada para negocios de tacos y comida rápida. Simplifica la gestión de ventas, menú y configuración.
      </p>
      <p className="text-sm text-gray-700">
        Versión: 1.0
      </p>
      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <p className="text-center mb-4">Desarrollado por <span className="font-semibold text-orange-600">Gabriel Benítez Villaverde</span></p>
        <p className="text-center">&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-base font-semibold text-gray-800 mb-3">Características Principales:</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Calculadora de consumo en tiempo real</li>
          <li>Control de venta de productos básico</li>
          <li>Configuración personalizada del negocio</li>
          <li>Adaptable a diferentes dispositivos</li>
          <li>Reportes diarios y exportación (PDF/Excel)</li>
          <li>Soporte multi-negocio y gestión de usuarios/roles</li>
          <li>Registro de movimientos (ingresos/egresos, etc.)</li>
        </ul>
      </div>
    </div>
  );
} 