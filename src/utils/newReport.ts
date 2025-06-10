// src/utils/newReport.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getDailySalesReport } from './dailySales';
import { BusinessConfig, MenuItem, DailySale } from '../types';
import { getMenu } from './menu';
import * as XLSX from 'xlsx'; // Aunque no se use en el PDF, se incluye por si acaso

interface ReportConfig {
  type: 'all' | 'topN' | 'top6profitable';
  nProducts?: number;
}

export const generateNewDailyReport = async (config: Config, reportConfig: ReportConfig) => {
  const { date, sales, totalSales, totalCost, totalProfit } = getDailySalesReport();
  
  // Calcular rentabilidad para cada producto
  const productsWithProfitability = sales.map(product => ({
    ...product,
    profitability: product.profit / product.cost
  }));

  // Ordenar productos por rentabilidad
  const sortedByProfitability = [...productsWithProfitability].sort((a, b) => b.profitability - a.profitability);

  let productsToShow;
  let othersGroup;

  switch (reportConfig.type) {
    case 'all':
      productsToShow = productsWithProfitability;
      break;
    case 'topN':
      const n = reportConfig.nProducts || 6;
      productsToShow = productsWithProfitability.slice(0, n);
      othersGroup = {
        name: 'Otros',
        quantity: productsWithProfitability.slice(n).reduce((sum, p) => sum + p.quantity, 0),
        sales: productsWithProfitability.slice(n).reduce((sum, p) => sum + p.sales, 0),
        cost: productsWithProfitability.slice(n).reduce((sum, p) => sum + p.cost, 0),
        profit: productsWithProfitability.slice(n).reduce((sum, p) => sum + p.profit, 0),
        profitability: 0
      };
      break;
    case 'top6profitable':
      productsToShow = sortedByProfitability.slice(0, 6);
      othersGroup = {
        name: 'Otros',
        quantity: sortedByProfitability.slice(6).reduce((sum, p) => sum + p.quantity, 0),
        sales: sortedByProfitability.slice(6).reduce((sum, p) => sum + p.sales, 0),
        cost: sortedByProfitability.slice(6).reduce((sum, p) => sum + p.cost, 0),
        profit: sortedByProfitability.slice(6).reduce((sum, p) => sum + p.profit, 0),
        profitability: 0
      };
      break;
  }

  const doc = new jsPDF();
  
  // Configuración del documento
  doc.setFontSize(20);
  doc.text('Reporte de Ventas Diario', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Fecha: ${date}`, 105, 30, { align: 'center' });
  doc.text(`Restaurante: ${config.restaurantName}`, 105, 40, { align: 'center' });
  
  // Tabla de productos
  const tableData = productsToShow.map(product => [
    product.name,
    product.quantity.toString(),
    `$${product.sales.toFixed(2)}`,
    `$${product.cost.toFixed(2)}`,
    `$${product.profit.toFixed(2)}`,
    `${(product.profitability * 100).toFixed(1)}%`
  ]);

  if (othersGroup) {
    tableData.push([
      othersGroup.name,
      othersGroup.quantity.toString(),
      `$${othersGroup.sales.toFixed(2)}`,
      `$${othersGroup.cost.toFixed(2)}`,
      `$${othersGroup.profit.toFixed(2)}`,
      '-'
    ]);
  }

  (doc as any).autoTable({
    startY: 50,
    head: [['Producto', 'Cantidad', 'Ventas', 'Costo', 'Ganancia', 'Rentabilidad']],
    body: tableData,
    foot: [
      [
        'Total',
        productsToShow.reduce((sum, p) => sum + p.quantity, 0).toString(),
        `$${totalSales.toFixed(2)}`,
        `$${totalCost.toFixed(2)}`,
        `$${totalProfit.toFixed(2)}`,
        `${((totalProfit / totalCost) * 100).toFixed(1)}%`
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [255, 140, 0] },
    footStyles: { fillColor: [255, 140, 0] }
  });

  // Guardar el PDF
  doc.save(`reporte_ventas_${date}.pdf`);
};

// Función auxiliar para obtener el nombre corto del método de pago
const getShortPaymentMethod = (method: string | undefined): string => {
  switch (method) {
    case 'cash': return 'Efec';
    case 'transfer': return 'Transf';
    case 'card': return 'Tarj';
    case 'mixed': return 'Mixto';
    default: return 'NoEsp';
  }
};

// Función para preparar los datos del resumen para Excel
const prepareResumenData = (config: BusinessConfig, sales: DailySale[], menuItems: MenuItem[], date: string) => {
  const first6Products = menuItems.slice(0, 6);
  const otherProductsHeader = 'Otros';
  const productTotalsResumen: { [key: string]: number } = {};
  const productMoneyTotalsDesglose: { [key: string]: number } = {};

  // Calcular totales del resumen
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      productTotalsResumen[item.id] = (productTotalsResumen[item.id] || 0) + item.quantity;
      const menuItem = menuItems.find(m => m.id === item.id);
      const price = menuItem?.price || 0;
      productMoneyTotalsDesglose[item.id] = (productMoneyTotalsDesglose[item.id] || 0) + (item.quantity * price);
    });
  });

  // Calcular totales de Efectivo, Transferencia y Tarjeta
  let totalEfectivoResumen = 0;
  let totalTransferResumen = 0;
  let totalTarjetaResumen = 0;
  let cantidadEfectivoResumen = 0;
  let cantidadTransferenciaResumen = 0;
  let cantidadTarjetaResumen = 0;

  const salesBySessionForSummary = sales.reduce((acc: { [key: string]: DailySale[] }, sale: DailySale) => {
    const sessionId = `${sale.tableNumber}-${new Date(sale.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    acc[sessionId] = acc[sessionId] || [];
    acc[sessionId].push(sale);
    return acc;
  }, {});

  for (const sessionId in salesBySessionForSummary) {
    const salesForSession = salesBySessionForSummary[sessionId];
    if (salesForSession.length > 0) {
      const paymentMethod = salesForSession[0]?.paymentMethod || 'No especificado';
      const sessionTotal = salesForSession.reduce((sum, sale) => sum + sale.total, 0);
      if (paymentMethod === 'transfer') {
        totalTransferResumen += sessionTotal;
        cantidadTransferenciaResumen++;
      } else if (paymentMethod === 'card') {
        totalTarjetaResumen += sessionTotal;
        cantidadTarjetaResumen++;
      } else {
        // Contabilizar como efectivo si es cash o no definido
        totalEfectivoResumen += sessionTotal;
        cantidadEfectivoResumen++;
      }
    }
  }

  const total = sales.reduce((sum, sale) => sum + sale.total, 0);

  return {
    data: [
      // Encabezado del negocio
      [config.name || ''],
      [config.reportTitle || 'Reporte Diario de Ventas', new Date(date).toLocaleDateString('es-MX')],
      [], // Línea en blanco
      // Encabezados de columnas
      ['Resumen', ...first6Products.map(p => p.name.substring(0, 12)), otherProductsHeader, '', 'Efec', 'Transf', 'Tarjeta', '', 'Total'],
      // Fila de unidades
      ['Unidades', 
        ...first6Products.map(p => String(productTotalsResumen[p.id] || 0)),
        String(Object.entries(productTotalsResumen)
          .filter(([id]) => !first6Products.some(p => p.id === id))
          .reduce((sum, [_, qty]) => sum + qty, 0)),
        '',
        String(cantidadEfectivoResumen),
        String(cantidadTransferenciaResumen),
        String(cantidadTarjetaResumen),
        '',
        String(cantidadEfectivoResumen + cantidadTransferenciaResumen + cantidadTarjetaResumen)
      ],
      // Fila de montos
      ['Monto Unidades',
        ...first6Products.map(p => `$${Number(productMoneyTotalsDesglose[p.id] || 0).toFixed(2)}`),
        `$${Number(Object.entries(productMoneyTotalsDesglose)
          .filter(([id]) => !first6Products.some(p => p.id === id))
          .reduce((sum, [_, amount]) => sum + amount, 0)).toFixed(2)}`,
        '',
        `$${Number(totalEfectivoResumen).toFixed(2)}`,
        `$${Number(totalTransferResumen).toFixed(2)}`,
        `$${Number(totalTarjetaResumen).toFixed(2)}`,
        '',
        `$${Number(totalEfectivoResumen + totalTransferResumen + totalTarjetaResumen).toFixed(2)}`
      ]
    ],
    first6Products,
    productTotalsResumen,
    productMoneyTotalsDesglose
  };
};

// Función para preparar los datos del desglose para Excel
const prepareDesgloseData = (config: BusinessConfig, sales: DailySale[], menuItems: MenuItem[], date: string, first6Products: MenuItem[], productMoneyTotalsDesglose: { [key: string]: number }) => {
  const otherProductsHeader = 'Otros';
  const salesBySession = sales.reduce((acc: { [key: string]: DailySale[] }, sale: DailySale) => {
    const sessionId = `${sale.tableNumber}-${new Date(sale.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    acc[sessionId] = acc[sessionId] || [];
    acc[sessionId].push(sale);
    return acc;
  }, {});

  const desgloseData = [
    // Encabezado del negocio
    [config.name || ''],
    [config.reportTitle || 'Reporte Diario de Ventas', new Date(date).toLocaleDateString('es-MX')],
    [], // Línea en blanco
    ['Ventas por Mesa:'],
    [], // Línea en blanco
    // Encabezados de columnas
    ['Mesa', ...first6Products.map(p => p.name.substring(0, 12)), otherProductsHeader, '', 'Método', '', 'Total']
  ];

  // Agregar filas de ventas por mesa
  const productTotalsDesgloseCantidad: { [key: string]: number } = {};
  let totalEfectivoDesglose = 0;
  let totalTransferDesglose = 0;
  let totalTarjetaDesglose = 0;

  for (const sessionId in salesBySession) {
    const salesForSession = salesBySession[sessionId];
    const [tableNumberStr, hora] = sessionId.split('-');
    const relevantSale = sales.find(sale => 
      String(sale.tableNumber) === tableNumberStr && 
      new Date(sale.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) === hora
    );
    const mesaNameAtSale = relevantSale?.tableNameAtSale ?? `Mesa ${tableNumberStr}`;
    const paymentMethod = salesForSession[0]?.paymentMethod || 'No especificado';
    let totalForSession = 0;
    let efectivoTotalSesion = 0;
    let transferenciaTotalSesion = 0;
    let tarjetaTotalSesion = 0;

    const productCounts: { [key: string]: number } = {};
    salesForSession.forEach((sale) => {
      if (sale.paymentMethod === 'mixed') {
        if (sale.cashPart) efectivoTotalSesion += sale.cashPart;
        if (sale.transferPart) transferenciaTotalSesion += sale.transferPart;
        if (sale.cardPart) tarjetaTotalSesion += sale.cardPart;
      } else if (sale.paymentMethod === 'cash') {
        efectivoTotalSesion += sale.total;
      } else if (sale.paymentMethod === 'transfer') {
        transferenciaTotalSesion += sale.total;
      } else if (sale.paymentMethod === 'card') {
        tarjetaTotalSesion += sale.total;
      }
      totalForSession += sale.total;
      sale.items.forEach((item) => {
        productCounts[item.id] = (productCounts[item.id] || 0) + item.quantity;
        productTotalsDesgloseCantidad[item.id] = (productTotalsDesgloseCantidad[item.id] || 0) + item.quantity;
      });
    });

    if (paymentMethod === 'transfer') {
      totalTransferDesglose += totalForSession;
    } else {
      totalEfectivoDesglose += totalForSession;
    }
    if (paymentMethod === 'card') {
      totalTarjetaDesglose += totalForSession;
    }

    desgloseData.push([
      `${mesaNameAtSale}\n${hora}`,
      ...first6Products.map(p => String(productCounts[p.id] || 0)),
      String(Object.entries(productCounts)
        .filter(([id]) => !first6Products.some(p => p.id === id))
        .reduce((sum, [_, qty]) => sum + qty, 0)),
      '',
      getShortPaymentMethod(paymentMethod),
      '',
      `$${Number(totalForSession).toFixed(2)}`
    ]);
  }

  const total = sales.reduce((sum, sale) => sum + sale.total, 0);

  // Agregar fila de totales por cantidad
  desgloseData.push([
    'Unidades',
    ...first6Products.map(p => String(productTotalsDesgloseCantidad[p.id] || 0)),
    String(Object.entries(productTotalsDesgloseCantidad)
      .filter(([id]) => !first6Products.some(p => p.id === id))
      .reduce((sum, [_, qty]) => sum + qty, 0)),
    '',
    '',
    '',
    `$${Number(total).toFixed(2)}`
  ]);

  // Agregar fila de totales monetarios
  desgloseData.push([
    'Monto Unidades',
    ...first6Products.map(p => `$${Number(productMoneyTotalsDesglose[p.id] || 0).toFixed(2)}`),
    `$${Number(Object.entries(productMoneyTotalsDesglose)
      .filter(([id]) => !first6Products.some(p => p.id === id))
      .reduce((sum, [_, amount]) => sum + amount, 0)).toFixed(2)}`,
    '',
    `$${Number(totalEfectivoDesglose).toFixed(2)}`,
    `$${Number(totalTransferDesglose).toFixed(2)}`,
    `$${Number(totalTarjetaDesglose).toFixed(2)}`,
    '',
    `$${Number(total).toFixed(2)}`
  ]);

  return desgloseData;
};

// Función para aplicar estilos a las hojas de Excel
const applyExcelStyles = (ws: XLSX.WorkSheet, data: any[][]) => {
  // Estilo para el encabezado del negocio
  ws['A1'].s = { font: { bold: true, size: 14 }, alignment: { horizontal: "center" } };
  ws['A2'].s = { font: { bold: true, size: 12 }, alignment: { horizontal: "center" } };

  // Estilo para los encabezados de columnas
  const headerStyle = {
    font: { bold: true, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "E6E6E6" } },
    alignment: { horizontal: "center", vertical: "center" }
  };

  for (let i = 0; i < data[3].length; i++) {
    const cell = XLSX.utils.encode_cell({ r: 3, c: i });
    ws[cell].s = headerStyle;
  }

  // Estilo para las filas de totales
  const totalStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "F0F0F0" } },
    alignment: { horizontal: "right", vertical: "center" }
  };

  const lastRow = data.length - 1;
  for (let i = 0; i < data[lastRow].length; i++) {
    const cell = XLSX.utils.encode_cell({ r: lastRow, c: i });
    ws[cell].s = totalStyle;
  }

  // Ajustar anchos de columna
  const wscols = [
    { wch: 15 }, // Mesa/Resumen
    ...Array(6).fill({ wch: 12 }), // Productos
    { wch: 12 }, // Otros
    { wch: 2 }, // Espacio
    { wch: 10 }, // Efectivo
    { wch: 10 }, // Transferencia
    { wch: 10 }, // Tarjeta
    { wch: 2 }, // Espacio
    { wch: 15 }  // Total
  ];
  ws['!cols'] = wscols;
};

// Función principal para exportar a Excel
export function exportNewDailyReportToExcel(config: BusinessConfig) {
  const { sales, total, products, date } = getDailySalesReport();
  const menuItems: MenuItem[] = getMenu();
  const wb = XLSX.utils.book_new();

  // Preparar datos para el resumen
  const { data: resumenData, first6Products, productMoneyTotalsDesglose } = prepareResumenData(config, sales, menuItems, date);

  // Preparar datos para el desglose
  const desgloseData = prepareDesgloseData(config, sales, menuItems, date, first6Products, productMoneyTotalsDesglose);

  // Crear hojas de Excel
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  const wsDesglose = XLSX.utils.aoa_to_sheet(desgloseData);

  // Aplicar estilos
  applyExcelStyles(wsResumen, resumenData);
  applyExcelStyles(wsDesglose, desgloseData);

  // Agregar hojas al libro
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsDesglose, "Ventas por Mesa");

  // Guardar el archivo
  const baseFileName = config.excelFileName || 'Reporte_Diario_Ventas';
  XLSX.writeFile(wb, `${baseFileName}-${date}.xlsx`);
}