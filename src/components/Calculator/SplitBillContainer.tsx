import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TacoOrder } from '../../types';
import { menuItems } from '../../data/menuItems';
import { formatCurrency } from '../../utils/currencyFormatter';
import { PaymentCalculator } from '../Calculator/PaymentCalculator/PaymentCalculator'; // Asumiendo que PaymentCalculator es un componente hermano o en esta ruta

// Definición de tipos más flexible para TabKey
type TabKey = string;

interface AssignedQuantitiesByTab {
    [key: string]: { // Esto es TabKey
        [itemId: string]: number; // itemId ahora es string
    };
}

interface SplitBillContainerProps {
    order: TacoOrder[];
    total: number;
    tableId: string;
    onClose: () => void;
}

const SplitBillContainer = ({ order, total, tableId, onClose }: SplitBillContainerProps): JSX.Element => {
    const [selectedCurrency] = useState('MXN');
    const [tabs, setTabs] = useState<TabKey[]>(['A', 'Res']);
    const [selectedTab, setSelectedTab] = useState<TabKey>('A');
    const [assignedQuantitiesByTab, setAssignedQuantitiesByTab] = useState<AssignedQuantitiesByTab>({});
    const [paidSubaccounts, setPaidSubaccounts] = useState<{ [key: string]: boolean }>({});
    const [localSubaccountPayment, setLocalSubaccountPayment] = useState<{ amount: number; method: 'cash' | 'transfer' | 'card' | 'mixed' | 'NoEsp' }>({ amount: 0, method: 'cash' });

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

    // Efecto para controlar el scroll del body
    useEffect(() => {
        // Bloquear el scroll cuando el componente se monta
        document.body.style.overflow = 'hidden';
        
        // Restaurar el scroll cuando el componente se desmonta
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Efecto para reiniciar el pago local cuando cambia de tab o se marca como pagada
    useEffect(() => {
        setLocalSubaccountPayment({ amount: 0, method: 'cash' });
    }, [selectedTab, paidSubaccounts]);

    const totalAssignedOverall = (itemId: string): number => {
        let sum = 0;
        for (const tab of tabs) {
            if (tab === 'Res' && paidSubaccounts['Res']) {
                sum += assignedQuantitiesByTab['Res']?.[itemId] || 0;
            } else {
                sum += assignedQuantitiesByTab[tab]?.[itemId] || 0;
            }
        }
        return sum;
    };

    // Verificar si hay alguna subcuenta pagada
    const hasPaidSubaccounts = Object.values(paidSubaccounts).some(isPaid => isPaid);

    // Calcular si todos los items del pedido están completamente asignados
    const allItemsAssigned = order.every(item => totalAssignedOverall(item.id) === item.quantity);

    const totalAssignedExcludingResto = (itemId: string): number =>
        Object.entries(assignedQuantitiesByTab).reduce((sum, [tab, items]) => {
            if (tab === 'Res') return sum;
            return sum + (items[itemId] || 0);
        }, 0);

    const restoQuantity = (itemId: string): number => {
        if (paidSubaccounts['Res']) {
            return assignedQuantitiesByTab['Res']?.[itemId] || 0;
        }
        const totalOrdered = order.find(item => item.id === itemId)?.quantity || 0;
        return totalOrdered - totalAssignedExcludingResto(itemId);
    };

    const getShortenedName = (name: string): string => {
        if (name.length <= 10) return name;
        return name.split(' ').map(word => word.substring(0, 3)).join(' ');
    };

    const getNextLetterTab = (existingTabs: string[]): string => {
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

        setSelectedTab(newLabel as TabKey); // Cast a TabKey después de asegurar que es válido
    };

    const handleQuantityChange = (itemId: string, value: number) => {
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

    const handlePaySubaccount = () => {
        const subtotal = calculateSubTotalForTab(selectedTab);
        const assignedItems = calculateAssignedItemsForTab(selectedTab);

        if (assignedItems === 0) {
            alert(`No hay productos asignados en la subcuenta "${selectedTab}".`);
            return;
        }

        // Contar cuántas subcuentas están actualmente pagadas
        const currentPaidTabsCount = Object.values(paidSubaccounts).filter(isPaid => isPaid).length;

        // Validación especial para la 4ta subcuenta pagada
        if (currentPaidTabsCount === 3 && !paidSubaccounts[selectedTab]) {
            const tolerance = 0.001;

            // Verificar si todos los ítems están completamente asignados
            if (!order.every(item => totalAssignedOverall(item.id) === item.quantity)) {
                alert('No se puede pagar esta subcuenta porque aún quedan productos del pedido principal sin asignar a ninguna subcuenta.');
                return;
            }

            // Verificar si el total de la orden se ha cubierto
            const totalPaidBeforeThisTab = Object.entries(paidSubaccounts)
                .filter(([_, isPaid]) => isPaid)
                .reduce((sum, [tab]) => sum + calculateSubTotalForTab(tab), 0);
            const projectedTotalPaid = totalPaidBeforeThisTab + subtotal;

            if (Math.abs(projectedTotalPaid - total) > tolerance) {
                alert(`El monto total a pagar, incluyendo esta subcuenta, no coincide con el total del pedido. Asegúrate de que todos los montos estén correctamente asignados.`);
                return;
            }
        }

        // Lógica específica para la subcuenta 'Res'
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

        // Marcar la subcuenta como pagada
        setPaidSubaccounts(prev => ({
            ...prev,
            [selectedTab]: true
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1.5 z-50">
            <div className="bg-white rounded-lg p-2 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold text-gray-800">Dividir Cuenta</h3>
                    <button
                        onClick={hasPaidSubaccounts ? () => {} : onClose}
                        className={`text-gray-500 hover:text-gray-700 ${hasPaidSubaccounts ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={hasPaidSubaccounts}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="w-full h-[60vh] bg-white border border-gray-200 rounded flex flex-col">
                    <div className="w-full h-[90%] flex overflow-y-auto">
                        {/* I1: Resumen */}
                        <div className="w-[42.36%] bg-rose-50 p-2 flex flex-col">
                            <h4 className="text-base font-semibold text-gray-700 mb-5">Resumen</h4>
                            <div className="flex-1 space-y-[0.55rem]">
                                {order.map(item => {
                                    const menuItem = menuItems.find(m => m.id === item.id)!;
                                    const subtotal = menuItem.price * item.quantity;
                                    return (
                                        <div key={item.id} className="flex text-gray-700 text-sm items-start gap-x-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                            <span>{getShortenedName(menuItem.name)} x {item.quantity.toFixed(2)}</span>
                                            <span className="ml-auto">| {formatCurrency(subtotal, selectedCurrency)}</span>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Tot</span>
                                        <span>{formatCurrency(total, selectedCurrency)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* I2: Tot */}
                        <div className="w-[9.28%] bg-amber-50 p-2 flex flex-col items-center">
                            <h4 className="text-base font-semibold text-gray-700 mb-5">Tot</h4>
                            <div className="flex-1 w-full flex flex-col items-center space-y-[0.55rem]">
                                {order.map(item => {
                                    const assignedTotal = totalAssignedOverall(item.id);
                                    const quantityColor = assignedTotal === item.quantity ? 'text-green-500' : 'text-red-500';
                                    return (
                                        <div key={item.id} className="text-gray-700 text-sm flex items-center justify-center">
                                            <span><span className={quantityColor}>{assignedTotal}</span></span>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-gray-200 pt-2 mt-2 text-center">
                                    <div className="font-bold text-base">
                                        <span>
                                            {order.reduce((sum, item) => sum + totalAssignedOverall(item.id), 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* I3: Subcuentas */}
                        <div className="w-[48.36%] bg-emerald-50 p-2 flex flex-col">

                            <div className="flex-1">
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

                                <div className="space-y-0.5 mt-4 px-0">
                                    {order.map(item => {
                                        const menuItem = menuItems.find(m => m.id === item.id)!;
                                        const quantity = selectedTab === 'Res'
                                            ? restoQuantity(item.id)
                                            : assignedQuantitiesByTab[selectedTab]?.[item.id] || 0;
                                        const subtotal = quantity * menuItem.price;

                                        return (
                                            <div key={item.id} className="flex items-center text-sm py-0">
                                                {paidSubaccounts[selectedTab] ? (
                                                    <span className="w-1/2 text-center py-0.5">{quantity}</span>
                                                ) : selectedTab === 'Res' ? (
                                                    <span className="w-1/2 text-center py-0.5">{quantity}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        className="w-1/2 border border-gray-00 px-1 py-0.5 rounded text-sm"
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

                                <PaymentCalculator 
                                    total={calculateSubTotalForTab(selectedTab)} 
                                    tableId={tableId}
                                    showIcons={true}
                                    localPayment={localSubaccountPayment}
                                    onLocalPaymentChange={setLocalSubaccountPayment}
                                    isSubaccount={true}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[10%] flex">
                        {/* Combined Notes Area */}
                        <div className="w-[51.64%] bg-white p-2 flex items-center justify-center text-sm text-gray-700 text-center">
                            {hasPaidSubaccounts && !allItemsAssigned ? (
                                'Agrega subcuentas o paga en "Resto"'
                            ) : allItemsAssigned ? (
                                'Todos los productos asignados. Puedes cerrar la cuenta.'
                            ) : (
                                'Asigna productos hasta en 4 subcuentas'
                            )}
                        </div>
                        {/* $ Subc button - retains its original width */}
                        <div className="w-[48.36%] bg-white p-1 flex items-center justify-center">
                            <button
                                onClick={handlePaySubaccount}
                                disabled={
                                    calculateAssignedItemsForTab(selectedTab) === 0 ||
                                    paidSubaccounts[selectedTab]
                                }
                                className={`px-4 py-1 rounded font-bold ${
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
                
                <div className="w-full h-[10%] bg-white flex items-center justify-center">
                    <button
                        onClick={hasPaidSubaccounts && !allItemsAssigned ? () => {} : onClose}
                        disabled={hasPaidSubaccounts && !allItemsAssigned}
                        className={`px-4 py-2 rounded font-bold ${!hasPaidSubaccounts ? 'bg-orange-500 text-white hover:bg-orange-600 transition-colors' : allItemsAssigned ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        {hasPaidSubaccounts && !allItemsAssigned ? 'Concluir Asignación' : allItemsAssigned ? 'Cerrar Cuenta' : 'Cerrar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitBillContainer; 