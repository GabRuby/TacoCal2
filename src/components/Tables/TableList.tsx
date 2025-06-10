// TableList.tsx
import React, { useState } from 'react';
import { Table2, PlusCircle, Trash2, User, FileText, AlertTriangle } from 'lucide-react';
import { useTables } from '../../contexts/TablesContext';
import { useMenu } from '../../contexts/MenuContext';
import { formatTime } from '../../utils/date';

interface NoMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToMenu: () => void;
}

function NoMenuModal({ isOpen, onClose, onGoToMenu }: NoMenuModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={24} />
            <h2 className="text-lg font-semibold text-gray-800">
              No hay productos en el menú
            </h2>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-600">
            Para poder registrar ventas, primero necesitas agregar productos al menú.
            ¿Deseas ir a la sección de menú para agregar productos?
          </p>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onGoToMenu}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
          >
            Ir a Menú
          </button>
        </div>
      </div>
    </div>
  );
}

export function TableList() {
  const { 
    tables, 
    activeTableId, 
    addTable, 
    removeTable, 
    startOrder, 
    setActiveTable,
    updateTableInfo 
  } = useTables();
  
  const { menuItems } = useMenu();
  const [showNoMenuModal, setShowNoMenuModal] = useState(false);
  const [pendingTableId, setPendingTableId] = useState<string | null>(null);

  const handleAddTable = () => {
    const maxNumber = Math.max(0, ...tables.map(t => t.number));
    addTable(maxNumber + 1);
  };

  const handleRenameTable = (tableId: string) => {
    const currentName = tables.find(t => t.id === tableId)?.name || '';
    const newName = prompt('Nuevo nombre para la mesa:', currentName);
  
    if (!newName) return; // Si canceló o dejó vacío
  
    // Verificar si ya existe otra mesa con ese nombre (solo activas)
    const duplicate = tables.some(
      (t) => t.id !== tableId && (t.name ?? `Mesa ${t.number}`) === newName
    );
  
    if (duplicate) {
      alert('Ya existe una mesa con ese nombre.');
      return;
    }
  
    updateTableInfo(tableId, { name: newName });
  };

  const handleTableClick = (table: { id: string; status: string }) => {
    // Si no hay productos en el menú, mostrar el modal en cualquier caso
    if (menuItems.length === 0) {
      setPendingTableId(table.id);
      setShowNoMenuModal(true);
      return;
    }

    // Si hay productos, proceder con la lógica normal
    if (table.status === 'available') {
      startOrder(table.id);
    } else {
      setActiveTable(table.id);
    }
  };

  const handleGoToMenu = () => {
    setShowNoMenuModal(false);
    // Si hay una mesa pendiente y está disponible, iniciar la orden después de agregar productos
    if (pendingTableId) {
      const pendingTable = tables.find(t => t.id === pendingTableId);
      if (pendingTable?.status === 'available') {
        startOrder(pendingTableId);
      } else {
        setActiveTable(pendingTableId);
      }
    }
    // Abrir el modal de configuración en la pestaña de menú
    const event = new CustomEvent('openSettingsMenu');
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-orange-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Mesas</h2>
        <button
          onClick={handleAddTable}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          <PlusCircle size={16} />
          Agregar Mesa
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tables.map((table) => (
          <div key={table.id} className="relative">
            <button
              onClick={() => handleTableClick(table)}
              className={`w-full p-3 rounded-lg ${
                activeTableId === table.id
                  ? 'ring-2 ring-orange-500'
                  : ''
              } ${
                table.status === 'available'
                  ? 'bg-white hover:bg-gray-50'
                  : 'bg-orange-100 hover:bg-orange-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Table2 size={18} className="text-orange-600" />
                {/* <span className="font-medium">Mesa {table.number}</span> */}
                <span
                  className="font-medium cursor-pointer"
                  onDoubleClick={() => handleRenameTable(table.id)}
                  title="Doble clic para renombrar"
                >
                  {table.name ?? `Mesa ${table.number}`}
                </span>


              </div>
              
              {table.status === 'occupied' && (
                <div className="space-y-1 text-left">
                  {table.customerName && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User size={14} />
                      <span className="truncate">{table.customerName}</span>
                    </div>
                  )}
                  {table.observations && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FileText size={14} />
                      <span className="truncate">{table.observations}</span>
                    </div>
                  )}
                  {table.startTime && (
                    <div className="text-sm text-gray-600">
                      Inicio: {formatTime(table.startTime)}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-sm mt-1">
                {table.status === 'available' ? (
                  <span className="text-green-600">Disponible</span>
                ) : (
                  <span className="text-orange-600">Ocupada</span>
                )}
              </div>
            </button>

            {table.status === 'available' && (
              <button
                onClick={() => removeTable(table.id)}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm transition-colors"
                title="Eliminar mesa"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <NoMenuModal
        isOpen={showNoMenuModal}
        onClose={() => {
          setShowNoMenuModal(false);
          setPendingTableId(null);
        }}
        onGoToMenu={handleGoToMenu}
      />
    </div>
  );
}