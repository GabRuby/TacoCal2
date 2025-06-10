// SplitBillModal.tsx
import React, { useState, useEffect } from 'react';
import { menuItems } from '../../data/menuItems';
import { PaymentCalculator } from '../Calculator/PaymentCalculator/PaymentCalculator'; // Asumiendo que PaymentCalculator es un componente hermano o en esta ruta
import { TacoOrder } from '../../types';
import { formatCurrency } from '../../utils/currencyFormatter';

interface SplitBillModalProps {
    order: TacoOrder[];
    total: number;
    onClose: () => void; // Para que SplitBillModal pueda pedir ser cerrado si lo desea
    // Comentamos temporalmente esta prop para probar la funcionalidad
    // onTotalPaidAmountChange: (currentTotalPaidAmount: number) => void;
}

type TabKey = string;

interface AssignedQuantitiesByTab {
    [tab: TabKey]: {
        [itemId: number]: number;
    };
}

const SplitBillModal = ({ order, total, onClose /*, onTotalPaidAmountChange */ }: SplitBillModalProps): JSX.Element => {
    const [tabs, setTabs] = useState<TabKey[]>(['A', 'Res']);
    const [selectedTab, setSelectedTab] = useState<TabKey>('A');
    const [assignedQuantitiesByTab, setAssignedQuantitiesByTab] = useState<AssignedQuantitiesByTab>({});
    const [paidSubaccounts, setPaidSubaccounts] = useState<{ [key: string]: boolean }>({});
    const [selectedCurrency, setSelectedCurrency] = useState('MXN'); // <-- ESTA LÍNEA YA LA TIENES
    // ...

    const getShortenedName = (name: string): string => {
        if (name.length <= 10) {
            return name;
        }
        return name.split(' ').map(word => word.substring(0, 3)).join(' ');
    };

    useEffect(() => {
        setAssignedQuantitiesByTab(prev => {
            const updated = { ...prev };

            tabs.forEach(tab => {
                if (tab !== 'Res' && !updated[tab]) {
                    updated[tab] = {};
                    order.forEach(item => {
                        updated[tab][item.id] = 0;
                    });
                }
            });

            return updated;
        });

        if (!tabs.includes(selectedTab)) {
            setSelectedTab(tabs[0]);
        }
    }, [order, tabs]);

    const totalAssignedExcludingResto = (itemId: number): number =>
        Object.entries(assignedQuantitiesByTab).reduce((sum, [tab, items]) => {
            if (tab === 'Res') return sum;
            return sum + (items[itemId] || 0);
        }, 0);

        const restoQuantity = (itemId: number): number => {
            // Si la subcuenta 'Res' ya está pagada, devolvemos las cantidades fijadas.
            if (paidSubaccounts['Res']) {
                return assignedQuantitiesByTab['Res']?.[itemId] || 0;
            }
        
            // Si no está pagada, calculamos la cantidad restante dinámicamente.
            const totalOrdered = order.find(item => item.id === itemId)?.quantity || 0;
            return totalOrdered - totalAssignedExcludingResto(itemId);
        };

        const totalAssignedOverall = (itemId: number): number => {
            let sum = 0;
            for (const tab of tabs) {
                // Si la subcuenta 'Res' está pagada, tomamos su cantidad fija.
                // Si no, o para otras subcuentas, tomamos la cantidad asignada dinámicamente.
                if (tab === 'Res' && paidSubaccounts['Res']) {
                    sum += assignedQuantitiesByTab['Res']?.[itemId] || 0;
                } else {
                    sum += assignedQuantitiesByTab[tab]?.[itemId] || 0;
                }
            }
            return sum;
        };

        const allAssigned = order.every(item =>
            totalAssignedOverall(item.id) === item.quantity
        );

    const handleQuantityChange = (itemId: number, value: number) => {
        if (selectedTab === 'Res' || paidSubaccounts[selectedTab]) return;

        setAssignedQuantitiesByTab(prev => {
            const newQuantities = { ...prev };
            const itemTotal = order.find(item => item.id === itemId)?.quantity || 0;

            const currentAssignedToSelectedTab = newQuantities[selectedTab]?.[itemId] || 0;
            const totalAssignedExcludingCurrentTab = totalAssignedOverall(itemId) - currentAssignedToSelectedTab;
            
            const maxAssignable = itemTotal - totalAssignedExcludingCurrentTab;
            const safeValue = Math.max(0, Math.min(value, maxAssignable));
            newQuantities[selectedTab][itemId] = safeValue;

            return newQuantities;
        });
    };

    const getNextLetterTab = (existingTabs: TabKey[]): TabKey => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (const char of letters) {
            if (!existingTabs.includes(char)) return char;
        }
        return `Extra${existingTabs.length}`;
    };

    const handleAddTab = () => {
        const newLabel = getNextLetterTab(tabs);
        const updatedTabs = [...tabs];
        const restoIndex = updatedTabs.indexOf('Res');
        updatedTabs.splice(restoIndex, 0, newLabel);
        setTabs(updatedTabs);

        setAssignedQuantitiesByTab(prev => {
            const newState = { ...prev };
            newState[newLabel] = {};
            order.forEach(item => {
                newState[newLabel][item.id] = 0;
            });
            return newState;
        });

        setSelectedTab(newLabel);
    };

    const calculateSubTotalForTab = (tabKey: TabKey): number =>
        order.reduce((sum, item) => {
            const quantity = tabKey === 'Res'
                ? restoQuantity(item.id)
                : assignedQuantitiesByTab[tabKey]?.[item.id] || 0;
            const price = menuItems.find(m => m.id === item.id)?.price || 0;
            return sum + quantity * price;
        }, 0);

    const calculateAssignedItemsForTab = (tabKey: TabKey): number =>
        order.reduce((sum, item) => {
            return sum + (tabKey === 'Res'
                ? restoQuantity(item.id)
                : assignedQuantitiesByTab[tabKey]?.[item.id] || 0);
        }, 0);

        const calculateTotalPaidAmount = (): number => {
            let totalPaid = 0;
            for (const tab of tabs) {
                if (paidSubaccounts[tab]) {
                    totalPaid += calculateSubTotalForTab(tab);
                }
            }
            return totalPaid;
        };

        const handlePaySubaccount = () => {
            const subtotal = calculateSubTotalForTab(selectedTab);
            const assignedItems = calculateAssignedItemsForTab(selectedTab);
        
            if (assignedItems === 0) {
                alert(`No hay productos asignados en la subcuenta "${selectedTab}".`);
                return;
            }
        
            // Contar cuántas subcuentas están actualmente pagadas (true en paidSubaccounts)
            const currentPaidTabsCount = Object.values(paidSubaccounts).filter(status => status).length;
        
            // --- Lógica de validación especial para la 4ta subcuenta pagada ---
            // Esta condición se activa si estamos a punto de pagar la 4ta subcuenta.
            // Asumimos que hay un máximo de 4 subcuentas que pueden ser pagadas (A, B, C, Res).
            // Si ya se han pagado 3 subcuentas Y la subcuenta actual no está pagada (es la que va a hacer la 4ta)
            if (currentPaidTabsCount === 3 && !paidSubaccounts[selectedTab]) {
                const tolerance = 0.001;
        
                // 1. Verificar si todos los ítems están completamente asignados
                if (!allAssigned) { // allAssigned debe ser order.every(item => totalAssignedOverall(item.id) === item.quantity)
                    alert('No se puede pagar esta subcuenta porque aún quedan productos del pedido principal sin asignar a ninguna subcuenta.');
                    return; // Impide el pago
                }
        
                // 2. Verificar si el total de la orden se ha cubierto con esta subcuenta
                const totalPaidBeforeThisTab = calculateTotalPaidAmount(); // Monto total de las subcuentas YA pagadas
                const projectedTotalPaid = totalPaidBeforeThisTab + subtotal; // Monto total si esta subcuenta se paga
        
                if (Math.abs(projectedTotalPaid - total) > tolerance) {
                    alert(`El monto total a pagar, incluyendo esta subcuenta, no coincide con el total del pedido. Asegúrate de que todos los montos estén correctamente asignados.`);
                    return; // Impide el pago
                }
            }
            // --- FIN Lógica de validación especial para la 4ta subcuenta pagada ---
        
            // Lógica específica para la subcuenta 'Res' (fijar cantidades si se paga)
            // Esto se ejecuta SIEMPRE que selectedTab sea 'Res', independientemente de si es la 4ta pagada o no,
            // pero solo si ha pasado las validaciones de arriba (si aplica).
            if (selectedTab === 'Res') {
                setAssignedQuantitiesByTab(prev => {
                    const newQuantities = { ...prev };
                    newQuantities['Res'] = {};
                    order.forEach(item => {
                        newQuantities['Res'][item.id] = restoQuantity(item.id);
                    });
                    return newQuantities;
                });
            }
        
            // Marcar la subcuenta como pagada (si pasó todas las validaciones)
            setPaidSubaccounts(prev => ({
                ...prev,
                [selectedTab]: true
            }));
        };

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex-1 flex flex-row gap-2 min-w-[460px] overflow-x-auto">
                {/* Sección 1: Resumen de la orden */}
                {/* Le daremos un ancho fijo o un flex-grow/shrink más controlado para que no se expanda demasiado */}
                <div className="w-[35%] md:w-[35%] px-0.5 flex-shrink-0"> {/* Reducido de 49% a 35% */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen</h3>
                    <div className="space-y-2 w-full px-0">
                        {order.map(item => {
                            const menuItem = menuItems.find(m => m.id === item.id)!;
                            const subtotal = menuItem.price * item.quantity;
                            return (
                                <div key={item.id} className="flex text-gray-700 text-sm items-start gap-x-1" style={{ minHeight: '1.5em' }}>
                                    <span>{getShortenedName(menuItem.name)} x {item.quantity.toFixed(2)}</span>
                                    <span className="ml-auto">| {formatCurrency(subtotal, selectedCurrency)}</span>
                                </div>
                            );
                        })}
                        <div className="border-t border-gray-200 pt-2 mt-">
                            <div className="flex justify-between font-bold text-base">
                                <span>Tot</span>
                                <span>{formatCurrency(total, selectedCurrency)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenedor de Asignación por subcuentas (Sección 2 y 3) */}
                {/* Este contendrá el resto del espacio y se dividirá entre Tot y Pestañas */}
                <div className="flex-1 flex min-w-0">
                    {/* Sección 2: Columna "Tot" de asignación */}
                    {/* Mantendremos un ancho fijo o muy pequeño, ya que solo muestra números */}
                    <div className="w-fit px-0.5 bg-orange-200 flex flex-col items-center flex-shrink-0"> {/* Ancho fijo, no encoge */}
                        <h3 className="text-lg font-semibold text-black text-center">Tot</h3>
                        <div className="mt-4 space-y-2 w-full flex flex-col items-center">
                            {order.map(item => {
                                // Ahora usamos totalAssignedOverall para mostrar el total asignado en todas las subcuentas
                                const assignedTotal = totalAssignedOverall(item.id); // <--- CAMBIO AQUÍ
                                const quantityColor = assignedTotal === item.quantity ? 'text-green-500' : 'text-red-500';
                                return (
                                    <div key={item.id} className="text-black text-sm flex items-center justify-center" style={{ minHeight: '1.5em' }}>
                                        <span><span className={quantityColor}>{assignedTotal}</span></span>
                                    </div>
                                );
                            })}
                            <div className="border-t border-gray-200 pt-2 mt-5 text-center">
                                <div className="font-bold text-base text-black">
                                    <span>
                                        {order.reduce((sum, item) => sum + totalAssignedOverall(item.id), 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Pestaña Seleccionada */}
                    {/* Esta tomará el espacio restante y se ajustará. Reduciremos el padding interno si es necesario. */}
                    <div className="flex-1 bg-yellow-100 min-w-0 px-2 py-0"> {/* flex-1 para que ocupe el resto, min-w-0 para permitir encoger, padding ajustado */}
                        <div className="flex mb-2 items-center justify-around">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-3 py-0.5 rounded font-bold ${selectedTab === tab ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-900 hover:bg-orange-200'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                            {tabs.filter(t => t !== 'Res').length < 3 && (
                                <button
                                    onClick={handleAddTab}
                                    className="px-3 py-0.5 rounded bg-green-400 text-white hover:bg-green-500"
                                >
                                    +
                                </button>
                            )}
                        </div>

                        <div className="space-y-1.5 mt-4 px-0"> {/* Aquí podrías ajustar el padding horizontal (px-0) si los campos se ven muy apretados */}
                            {order.map(item => {
                                const menuItem = menuItems.find(m => m.id === item.id)!;
                                const quantity = selectedTab === 'Res'
                                    ? restoQuantity(item.id)
                                    : assignedQuantitiesByTab[selectedTab]?.[item.id] || 0;
                                const subtotal = quantity * menuItem.price;

                                return (
                                    <div key={item.id} className="flex items-center text-sm py-0.25" style={{ minHeight: '0.5em' }}>
                                        {paidSubaccounts[selectedTab] ? (
                                            <span className="w-1/2 text-center py-0.5">{quantity}</span>
                                        ) : selectedTab === 'Res' ? (
                                            <span className="w-1/2 text-center py-0.5">{quantity}</span>
                                        ) : (
                                            <input
                                                type="number"
                                                className="w-1/2 border border-gray-00 px-1 rounded"
                                                value={quantity}
                                                min={0}
                                                max={item.quantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                                                }
                                            />
                                        )}
                                        <span className="w-1/2 text-right">{formatCurrency(subtotal, selectedCurrency)}</span>
                                    </div>
                                );
                            })}
                            <div className="border-t border-gray-300 pt-2 mt-4 flex justify-between font-bold text-base">
                                <span>{calculateAssignedItemsForTab(selectedTab)}</span>
                                <span>{formatCurrency(calculateSubTotalForTab(selectedTab), selectedCurrency)}</span>
                            </div>
                        </div>

                        <PaymentCalculator total={calculateSubTotalForTab(selectedTab)} />

                        <div className="mt-2 text-center">
                            <button
                                onClick={handlePaySubaccount}
                                disabled={
                                    calculateAssignedItemsForTab(selectedTab) === 0 ||
                                    paidSubaccounts[selectedTab]
                                }
                                className={`px-4 py-1 rounded font-bold mt-2 ${
                                    calculateAssignedItemsForTab(selectedTab) === 0 || paidSubaccounts[selectedTab]
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                            >
                                $ Subc
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitBillModal;