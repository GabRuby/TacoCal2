// reports.ts
import jsPDF from 'jspdf';
import { getDailySalesReport } from './dailySales';
import { BusinessConfig, MenuItem, DailySale } from '../types';
import { getMenu } from './menu';
import * as XLSX from 'xlsx';

export function generateDailyReport(config: BusinessConfig) {
  const { sales, total, products, date } = getDailySalesReport();
  const menuItems: MenuItem[] = getMenu();
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let y = margin + 5; // Margen superior reducido
  let centerX = pageWidth / 2;
  let currentX: number;
  let textWidth: number;
  const rowHeight = 9; // Declarar rowHeight al principio
  let mesaColumnWidth: number; // Declarar mesaColumnWidth al principio
  let productColumnWidth: number; // Declarar productColumnWidth al principio
  const productTotalsResumen: { [key: string]: number } = {}; // Para los totales del resumen
  const productMoneyTotalsDesglose: { [key: string]: number } = {}; // Para los totales monetarios del desglose
  const bottomMargin = 20; // Margen inferior ajustado (ligeramente aumentado) para la numeración de página
  let contentPageCount = 1; // Inicializar el contador de páginas de contenido
  let cellCounter = 1; // Contador para identificar las celdas temporalmente

  // Header
  if (config?.imageUrl) {
    try {
      const img = new Image();
      img.src = config.imageUrl;
      const imgAspectRatio = img.width / img.height;
      const logoHeight = 20;
      const logoWidth = logoHeight * imgAspectRatio;
      const logoX = centerX - (logoWidth / 2);
      doc.addImage(img, 'PNG', logoX, y, logoWidth, logoHeight);
      y += 25;
    } catch (error) {
      console.error('Error al cargar la imagen del logo:', error);
    }
  }

  if (config?.name) {
    doc.setFontSize(16);
    textWidth = doc.getTextWidth(config.name);
    currentX = centerX - (textWidth / 2);
    doc.text(config.name, currentX, y);
    y += 10;
  }

  doc.setFontSize(14);
  const reportText = `Resumen del Día ${new Date(date).toLocaleDateString('es-MX')}`;
  textWidth = doc.getTextWidth(reportText);
  currentX = centerX - (textWidth / 2);
  doc.text(reportText, currentX, y);
  y += 15;

  // Obtener los primeros 6 productos del menú
  const first6Products = menuItems.slice(0, 6);
  const otherProductsHeader = 'Otros';

  // Calcular el ancho de las columnas de la tabla usando medidas específicas en mm
  const availableWidth = pageWidth - (2 * margin); // Ancho disponible después de márgenes

  // Definir anchos específicos en milímetros
  mesaColumnWidth = 45; // 45mm para Mesa
  const totalColumnWidth = 25; // 25mm para Total
  const efectivoColumnWidth = 20; // 20mm para Efectivo
  const transferColumnWidth = 20; // 20mm para Transferencia
  const paymentMethodWidth = efectivoColumnWidth + transferColumnWidth; // 40mm para Método de pago (suma de Efectivo y Transferencia)
  
  // Calcular el ancho restante para las columnas de productos
  const remainingWidth = availableWidth - mesaColumnWidth - totalColumnWidth - efectivoColumnWidth - transferColumnWidth - 10; // 10mm de espacio extra
  productColumnWidth = remainingWidth / 7; // Dividir el espacio restante entre 7 columnas (6 productos + Otros)

  // *** CICLO PARA CALCULAR TOTALES DEL RESUMEN Y TOTALES MONETARIOS DEL DESGLOSE ***
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      productTotalsResumen[item.id] = (productTotalsResumen[item.id] || 0) + item.quantity;
      const menuItem = menuItems.find(m => m.id === item.id);
      const price = menuItem?.price || 0;
      productMoneyTotalsDesglose[item.id] = (productMoneyTotalsDesglose[item.id] || 0) + (item.quantity * price);
    });
  });

  // Definir colores para las líneas
  const lineColor = [207, 207, 207]; // 10% más oscuro que el encabezado

  // --- Resumen del día ---
  doc.setFontSize(10);
  doc.text('Resumen del Día', margin, y);
  y += 5;

  // Fila de encabezados del resumen
  doc.setFontSize(8);
  doc.setFillColor(230, 230, 230);
  doc.setTextColor(0);
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
  
  // Dibujar líneas del encabezado del resumen
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.setLineWidth(0.1);
  // Horizontal top
  doc.line(margin, y, pageWidth - margin, y);
  // Horizontal bottom
  doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

  // Vertical lines
  let currentLineX = margin;
  doc.line(currentLineX, y, currentLineX, y + rowHeight); // Mesa left
  currentLineX += mesaColumnWidth;
  doc.line(currentLineX, y, currentLineX, y + rowHeight); // Mesa right / Product 1 left
  for (let i = 0; i < 7; i++) { // 6 products + Otros
      currentLineX += productColumnWidth;
      doc.line(currentLineX, y, currentLineX, y + rowHeight);
  }
  currentLineX += efectivoColumnWidth; // Efectivo
  doc.line(currentLineX, y, currentLineX, y + rowHeight);
  currentLineX += transferColumnWidth; // Transferencia
    doc.line(currentLineX, y, currentLineX, y + rowHeight);
  doc.line(pageWidth - margin, y, pageWidth - margin, y + rowHeight); // Total right

  // Encabezados del resumen con números temporales encima
  doc.setTextColor(0);

  // Mesa
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.setFontSize(8); // Volver al tamaño original para el texto del encabezado
  doc.text('Mesa', margin + mesaColumnWidth / 2, y + rowHeight - 3, { align: 'center' });

  let tableXResumen = margin + mesaColumnWidth;

  // Productos (6 columnas)
  first6Products.forEach((product) => {
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.setFontSize(8); // Volver al tamaño original para el texto del encabezado
    doc.text(product.name.substring(0, 12), tableXResumen + productColumnWidth / 2, y + rowHeight - 3, { align: 'center' });
    tableXResumen += productColumnWidth;
  });

  // Otros
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.setFontSize(8); // Volver al tamaño original para el texto del encabezado
  doc.text(otherProductsHeader, tableXResumen + productColumnWidth / 2, y + rowHeight - 3, { align: 'center' });
  tableXResumen += productColumnWidth;

  // Efectivo
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.setFontSize(8); // Volver al tamaño original para el texto del encabezado
  doc.text('Efect', tableXResumen + efectivoColumnWidth / 2, y + rowHeight - 3, { align: 'center' });
  tableXResumen += efectivoColumnWidth;

  // Transferencia
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.setFontSize(8); // Volver al tamaño original para el texto del encabezado
  doc.text('Transf', tableXResumen + transferColumnWidth / 2, y + rowHeight - 3, { align: 'center' });
  tableXResumen += transferColumnWidth;

  // Total
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.setFontSize(8); // Volver al tamaño original para el texto del encabezado
  doc.text('Total', tableXResumen + totalColumnWidth / 2, y + rowHeight - 3, { align: 'center' });

  y += rowHeight;

  // --- Fila de Totales por Cantidad del Resumen ---
doc.setFontSize(10);
  doc.setFillColor(240, 240, 240); // Fondo gris claro
doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
  doc.setTextColor(0); // Color de texto negro

  // Dibujar líneas de la fila de totales por cantidad del resumen
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.setLineWidth(0.1);
  // Horizontal bottom
  doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

  // Vertical lines (usando los anchos definidos anteriormente)
  let currentLineXQuantities = margin;
  doc.line(currentLineXQuantities, y, currentLineXQuantities, y + rowHeight); // Mesa left
  currentLineXQuantities += mesaColumnWidth;
  doc.line(currentLineXQuantities, y, currentLineXQuantities, y + rowHeight); // Mesa right / Product 1 left
  for (let i = 0; i < 7; i++) { // 6 products + Otros
      currentLineXQuantities += productColumnWidth;
      doc.line(currentLineXQuantities, y, currentLineXQuantities, y + rowHeight);
  }
  currentLineXQuantities += efectivoColumnWidth; // Efectivo
  doc.line(currentLineXQuantities, y, currentLineXQuantities, y + rowHeight);
  currentLineXQuantities += transferColumnWidth; // Transferencia
  doc.line(currentLineXQuantities, y, currentLineXQuantities, y + rowHeight);
  doc.line(pageWidth - margin, y, pageWidth - margin, y + rowHeight); // Total right

  // Contenido de la fila de totales por cantidad del resumen con números temporales encima
  let contentXQuantities = margin;
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.text('Total', contentXQuantities + mesaColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Centrado verticalmente
  contentXQuantities += mesaColumnWidth;

  first6Products.forEach((product) => {
    const totalQuantity = productTotalsResumen[product.id] || 0;
    doc.setFontSize(6);
    doc.text(String(totalQuantity), contentXQuantities + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo cantidad, centrado verticalmente
    contentXQuantities += productColumnWidth;
  });

let otherTotalQuantityResumen = 0;
  for (const productId in productTotalsResumen) {
    if (!first6Products.some(p => p.id === productId)) {
      otherTotalQuantityResumen += productTotalsResumen[productId];
    }
  }
  doc.setFontSize(6);
  doc.text(String(otherTotalQuantityResumen), contentXQuantities + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo cantidad, centrado verticalmente
  contentXQuantities += productColumnWidth;

  // Calcular totales de Efectivo y Transferencia (si no se calculan antes)
  let totalEfectivoResumen = 0;
  let totalTransferResumen = 0;
  let cantidadEfectivoResumen = 0;
  let cantidadTransferenciaResumen = 0;

   sales.forEach(sale => {
     if (sale.paymentMethod === 'transfer') {
       totalTransferResumen += sale.total;
       cantidadTransferenciaResumen++;
     } else {
       // Contabilizar como efectivo si es cash o no definido
       totalEfectivoResumen += sale.total;
       cantidadEfectivoResumen++;
     }
   });

  // Agregar columnas de Efectivo y Transferencia (cantidades) con números temporales encima
  // Efectivo
  doc.setFontSize(6);
  doc.text(String(cantidadEfectivoResumen), contentXQuantities + efectivoColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo cantidad, centrado verticalmente
  contentXQuantities += efectivoColumnWidth;

  // Transferencia
  doc.setFontSize(6);
  doc.text(String(cantidadTransferenciaResumen), contentXQuantities + transferColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo cantidad, centrado verticalmente
  contentXQuantities += transferColumnWidth;

  // Espacio para el total general (en esta fila no se muestra el monto total)
  doc.setFontSize(6);
  // No dibujar contenido en esta celda

  y += rowHeight; // Avanzar Y para la segunda fila de totales

  // --- Fila de Totales Monetarios del Resumen ---
  doc.setFontSize(10);
  doc.setFillColor(250, 250, 250); // Fondo gris ligeramente diferente
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
  doc.setTextColor(0); // Color de texto negro

  // Dibujar líneas de la fila de totales monetarios del resumen
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.setLineWidth(0.1);
  // Horizontal bottom
  doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

  // Vertical lines (usando los mismos anchos)
  let currentLineXMoney = margin;
  doc.line(currentLineXMoney, y, currentLineXMoney, y + rowHeight); // Mesa left
  currentLineXMoney += mesaColumnWidth;
  doc.line(currentLineXMoney, y, currentLineXMoney, y + rowHeight); // Mesa right / Product 1 left
  for (let i = 0; i < 7; i++) { // 6 products + Otros
      currentLineXMoney += productColumnWidth;
      doc.line(currentLineXMoney, y, currentLineXMoney, y + rowHeight);
  }
  currentLineXMoney += efectivoColumnWidth;
  doc.line(currentLineXMoney, y, currentLineXMoney, y + rowHeight);
  currentLineXMoney += transferColumnWidth;
  doc.line(currentLineXMoney, y, currentLineXMoney, y + rowHeight);
  doc.line(pageWidth - margin, y, pageWidth - margin, y + rowHeight); // Total right

  // Contenido de la fila de totales monetarios del resumen con números temporales encima
  let contentXMoney = margin;
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.text('Monto', contentXMoney + mesaColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Cambiado de 'Total Venta' a 'Monto' y centrado verticalmente
  contentXMoney += mesaColumnWidth;

  first6Products.forEach((product) => {
    const totalMoney = productMoneyTotalsDesglose[product.id] || 0;
    doc.setFontSize(6);
    doc.text(`$${totalMoney.toFixed(2)}`, contentXMoney + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
    contentXMoney += productColumnWidth;
  });

  let totalVentaResumenOtros = 0;
  for (const productId in productMoneyTotalsDesglose) {
    if (!first6Products.some(p => p.id === productId)) {
      totalVentaResumenOtros += productMoneyTotalsDesglose[productId];
    }
  }
  doc.setFontSize(6);
  doc.text(`$${totalVentaResumenOtros.toFixed(2)}`, contentXMoney + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
  contentXMoney += productColumnWidth; // Posición después de "Otros"

  // Agregar columnas de Efectivo y Transferencia (montos) con números temporales encima
  // Efectivo
  doc.setFontSize(6);
  doc.text(`$${totalEfectivoResumen.toFixed(2)}`, contentXMoney + efectivoColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
  contentXMoney += efectivoColumnWidth;

  // Transferencia
  doc.setFontSize(6);
  doc.text(`$${totalTransferResumen.toFixed(2)}`, contentXMoney + transferColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
  contentXMoney += transferColumnWidth;

  // Total general del resumen con número temporal encima y alineado a la derecha
  doc.setFontSize(6);
  doc.text(`$${String(Number(total.toFixed(2)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}`, pageWidth - margin - 3, y + rowHeight / 2 + 2, { align: 'right' }); // Monto total alineado a la derecha y centrado verticalmente, ajustada la posición X

  y += rowHeight + 10; // Ajustar el avance de Y después de las dos filas de totales

  // --- Tabla de Productos por Mesa (Desglose) ---
  doc.setFontSize(14);
  doc.text('Ventas por Mesa:', margin, y);
  y += 10;

  let tableX = margin;
  let tableHeaderY = y;

  // Definir colores para las columnas
  const headerColor = [230, 230, 230]; // Color actual del encabezado
  const columnColor1 = [218, 218, 218]; // 5% más oscuro que el encabezado
  const columnColor2 = [207, 207, 207]; // 10% más oscuro que el encabezado (para alternar)

  // Función para dibujar el fondo de las columnas
  const drawColumnBackgrounds = (y: number, isEvenRow: boolean, actualRowHeight: number) => {
    const columnColor = isEvenRow ? columnColor1 : columnColor2;
    // Primera columna (Mesa)
    doc.setFillColor(columnColor[0], columnColor[1], columnColor[2]);
    doc.rect(margin, y, mesaColumnWidth, actualRowHeight, 'F');
    // Última columna (Total)
    doc.rect(pageWidth - margin - totalColumnWidth, y, totalColumnWidth, actualRowHeight, 'F');
  };

  // Función para dibujar el encabezado de la tabla de desglose
  const drawTableHeaderDesglose = (totalColumnWidth: number) => {
    doc.setFontSize(8);
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.setTextColor(0);
    doc.rect(tableX, tableHeaderY, pageWidth - 2 * margin, rowHeight, 'F');

    // Dibujar líneas del encabezado del desglose
    doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
    doc.setLineWidth(0.1);
    // Horizontal top
    doc.line(margin, tableHeaderY, pageWidth - margin, tableHeaderY);
    // Horizontal bottom
    doc.line(margin, tableHeaderY + rowHeight, pageWidth - margin, tableHeaderY + rowHeight);

    // Vertical lines
    let currentLineX = margin;
    doc.line(currentLineX, tableHeaderY, currentLineX, tableHeaderY + rowHeight); // Mesa left
    currentLineX += mesaColumnWidth;
    doc.line(currentLineX, tableHeaderY, currentLineX, tableHeaderY + rowHeight); // Mesa right / Product 1 left
    for (let i = 0; i < 7; i++) { // 6 products + Otros
        currentLineX += productColumnWidth;
        doc.line(currentLineX, tableHeaderY, currentLineX, tableHeaderY + rowHeight);
    }
    currentLineX += paymentMethodWidth; // Método de pago
    doc.line(currentLineX, tableHeaderY, currentLineX, tableHeaderY + rowHeight);
    doc.line(pageWidth - margin, tableHeaderY, pageWidth - margin, tableHeaderY + rowHeight); // Total right

    // Encabezados con números temporales encima
    let headerTableX = tableX;

    // Mesa (celda 34)
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.text('Mesa', headerTableX + mesaColumnWidth / 2, tableHeaderY + 6, { align: 'center' });
    headerTableX += mesaColumnWidth;

    // Productos (6 columnas + Otros) (celdas 35 a 41)
    first6Products.forEach((product) => {
      doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
      doc.text(product.name.substring(0, 12), headerTableX + productColumnWidth / 2, tableHeaderY + 6, { align: 'center' });
      headerTableX += productColumnWidth;
    });
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.text(otherProductsHeader, headerTableX + productColumnWidth / 2, tableHeaderY + 6, { align: 'center' });
    headerTableX += productColumnWidth; // Posición después de "Otros"

    // Método (celda 42)
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.text('Método', headerTableX + paymentMethodWidth / 2, tableHeaderY + 6, { align: 'center' });
    headerTableX += paymentMethodWidth;

    // Total (celda 43)
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.text('Total     ', pageWidth - margin - 3, tableHeaderY + 6, { align: 'right' }); // Total alineado a la derecha, ajustada la posición X, añadidos 4 espacios

    y = tableHeaderY + rowHeight + 2; // Ajustar 'y' después del encabezado
  };

  // Llamar a la función del encabezado del desglose
  drawTableHeaderDesglose(totalColumnWidth);

  // Filas de datos (por mesa y hora) del desglose
  const salesBySession = sales.reduce((acc: { [key: string]: DailySale[] }, sale: DailySale) => {
    const sessionId = `${sale.tableNumber}-${new Date(sale.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    acc[sessionId] = acc[sessionId] || [];
    acc[sessionId].push(sale);
    return acc;
  }, {});

  const productTotalsDesgloseCantidad: { [key: string]: number } = {}; // Para los totales de cantidad del desglose

  let rowIndex = 0; // Reiniciar rowIndex para el desglose
  for (const sessionId in salesBySession) {
    const salesForSession = salesBySession[sessionId];
    const productCounts: { [key: string]: number } = {};
    let totalForSession = 0;
    let paymentMethod = salesForSession[0]?.paymentMethod || 'No especificado';

    // Calcular la altura real de la fila si el contenido ocupa más de una línea
    const mesaContent = `Mesa ${sessionId.split('-')[0]}
${sessionId.split('-')[1]}`;
    const mesaHeight = doc.getTextDimensions(mesaContent, { fontSize: 8 }).h + doc.getTextDimensions(mesaContent, { fontSize: 6 }).h; // Aproximación de la altura combinada
    const actualRowHeight = Math.max(rowHeight, mesaHeight + 2);

    // Calcular totales de productos para esta sesión
    salesForSession.forEach(sale => {
      sale.items.forEach(item => {
          productCounts[item.id] = (productCounts[item.id] || 0) + item.quantity;
        const menuItem = menuItems.find(m => m.id === item.id);
        const price = menuItem?.price || 0;
        totalForSession += (item.quantity * price);
      });
    });

    // Dibujar fondo de las columnas
    drawColumnBackgrounds(y, rowIndex % 2 === 0, actualRowHeight); // Usar rowIndex para alternar colores

    // Dibujar líneas de la fila de datos del desglose
    doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
    doc.setLineWidth(0.1);
    // Horizontal bottom
    doc.line(margin, y + actualRowHeight, pageWidth - margin, y + actualRowHeight);

    // Vertical lines
    currentLineX = margin;
    doc.line(currentLineX, y, currentLineX, y + actualRowHeight); // Mesa left
    currentLineX += mesaColumnWidth;
    doc.line(currentLineX, y, currentLineX, y + actualRowHeight); // Mesa right / Product 1 left
    for (let i = 0; i < 7; i++) { // 6 products + Otros
        currentLineX += productColumnWidth;
        doc.line(currentLineX, y, currentLineX, y + actualRowHeight);
    }
    currentLineX += paymentMethodWidth; // Método de pago
    doc.line(currentLineX, y, currentLineX, y + actualRowHeight);
    doc.line(pageWidth - margin, y, pageWidth - margin, y + actualRowHeight); // Total right

    // Contenido de la fila de datos del desglose
    tableX = margin;
    // Mesa y Hora
    doc.setFontSize(8);
    // Usar tableNameAtSale si existe, de lo contrario usar tableNumber y la hora de la sesión
    const mesaDisplay = salesForSession[0]?.tableNameAtSale || `Mesa ${salesForSession[0]?.tableNumber || '-'}`;
    const horaDisplay = new Date(salesForSession[0]?.timestamp || Date.now()).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    doc.text(mesaDisplay, tableX + mesaColumnWidth / 2, y + actualRowHeight / 2 - 2, { align: 'center' }); // Centrar el texto de la mesa/hora verticalmente
    doc.text(horaDisplay, tableX + mesaColumnWidth / 2, y + actualRowHeight / 2 + 4, { align: 'center' });
    tableX += mesaColumnWidth;

    // Productos (6 columnas + Otros) (celdas 45 a 51)
    first6Products.forEach((topProduct) => {
      const count = productCounts[topProduct.id] || 0;
      doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
      doc.text(String(count), tableX + productColumnWidth / 2, y + actualRowHeight / 2 + 2, { align: 'center' }); // Centrar verticalmente
      delete productCounts[topProduct.id]; // Eliminar del conteo para los "Otros"
      tableX += productColumnWidth;
    });
    let otherCount = 0;
    for (const productId in productCounts) {
      otherCount += productCounts[productId];
    }
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.text(String(otherCount), tableX + productColumnWidth / 2, y + actualRowHeight / 2 + 2, { align: 'center' }); // Centrar verticalmente
    tableX += productColumnWidth; // Posición después de "Otros"

    // Método (celda 52)
    const paymentMethodText = getShortPaymentMethod(paymentMethod);
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.text(paymentMethodText, tableX + paymentMethodWidth / 2, y + actualRowHeight / 2 + 2, { align: 'center' }); // Centrar verticalmente
    tableX += paymentMethodWidth;

    // Total (celda 53)
    doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
    doc.text(`$${String(Number(totalForSession.toFixed(2)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}`, pageWidth - margin - 3, y + actualRowHeight / 2 + 2, { align: 'right' }); // Total alineado a la derecha y centrado verticalmente, ajustada la posición X

    y += actualRowHeight; // Usar actualRowHeight para avanzar a la siguiente fila
    rowIndex++;

    // Manejo de salto de página en el desglose
    if (y + actualRowHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = margin + 5; // Reiniciar Y en la nueva página
        contentPageCount++;
         // Repetir encabezado de la tabla de desglose en la nueva página
        tableHeaderY = y;
        drawTableHeaderDesglose(totalColumnWidth);
         y += rowHeight + 2; // Ajustar Y después de repetir el encabezado
    }
  }

  // --- Fila de Totales por Cantidad del Desglose (al final del desglose) ---
  doc.setFontSize(10);
  doc.setFillColor(240, 240, 240); // Fondo gris claro
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
  drawColumnBackgrounds(y, true, rowHeight); // Usar rowHeight fijo para las filas de totales
  doc.setTextColor(0); // Color de texto negro

  // Dibujar líneas de la fila de totales por cantidad del desglose
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.setLineWidth(0.1);
  // Horizontal bottom
  doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

  // Vertical lines
  currentLineX = margin;
  doc.line(currentLineX, y, currentLineX, y + rowHeight); // Mesa left
  currentLineX += mesaColumnWidth;
  doc.line(currentLineX, y, currentLineX, y + rowHeight); // Mesa right / Product 1 left
  for (let i = 0; i < 7; i++) { // 6 products + Otros
      currentLineX += productColumnWidth;
      doc.line(currentLineX, y, currentLineX, y + rowHeight);
  }
  currentLineX += paymentMethodWidth; // Método de pago
  doc.line(currentLineX, y, currentLineX, y + rowHeight);
  doc.line(pageWidth - margin, y, pageWidth - margin, y + rowHeight); // Total right

  // Contenido de la fila de totales por cantidad del desglose con números temporales encima
  let contentXCantidad = margin;
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.text('Total', contentXCantidad + mesaColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Centrado verticalmente
  contentXCantidad += mesaColumnWidth;

  first6Products.forEach((product) => {
    const productTotalQuantity = productTotalsDesgloseCantidad[product.id] || 0;
    doc.setFontSize(6);
    doc.text(String(productTotalQuantity), contentXCantidad + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo cantidad, centrado verticalmente
    contentXCantidad += productColumnWidth;
  });
  let otherTotalQuantityDesglose = 0;
  for (const productId in productTotalsDesgloseCantidad) {
    if (!first6Products.some(p => p.id === productId)) {
      otherTotalQuantityDesglose += productTotalsDesgloseCantidad[productId];
    }
  }
  doc.setFontSize(6);
  doc.text(String(otherTotalQuantityDesglose), contentXCantidad + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo cantidad, centrado verticalmente
  contentXCantidad += productColumnWidth;

  // Espacio para el total general (en esta fila no se muestra el monto total)
  doc.setFontSize(6);
  // No dibujar contenido en esta celda

  y += rowHeight; // Avanzar Y para la segunda fila de totales

  // --- Nueva Fila de Totales Monetarios del Desglose ---
  doc.setFontSize(10);
  doc.setFillColor(250, 250, 250); // Un color ligeramente diferente para distinguirla
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
  drawColumnBackgrounds(y, false, rowHeight); // Usar false para el color alterno, rowHeight fijo
  doc.setTextColor(0); // Color de texto negro

  // Dibujar líneas de la fila de totales monetarios del desglose
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.setLineWidth(0.1);
  // Horizontal bottom
  doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

  // Vertical lines
  currentLineX = margin;
  doc.line(currentLineX, y, currentLineX, y + rowHeight); // Mesa left
  currentLineX += mesaColumnWidth;
  doc.line(currentLineX, y, currentLineX, y + rowHeight); // Mesa right / Product 1 left
  for (let i = 0; i < 7; i++) { // 6 products + Otros
      currentLineX += productColumnWidth;
      doc.line(currentLineX, y, currentLineX, y + rowHeight);
  }
  currentLineX += paymentMethodWidth; // Método de pago
  doc.line(currentLineX, y, currentLineX, y + rowHeight);
  doc.line(pageWidth - margin, y, pageWidth - margin, y + rowHeight); // Total right

  // Contenido de la fila de totales monetarios del desglose con números temporales encima
  let contentXDinero = margin;
  doc.setFontSize(6); // Tamaño de fuente más pequeño para el número
  doc.text('Total Venta', contentXDinero + mesaColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Centrado verticalmente
  contentXDinero += mesaColumnWidth;

  let totalVentaOtros = 0;
  first6Products.forEach((product) => {
    const totalMoney = productMoneyTotalsDesglose[product.id] || 0;
    doc.setFontSize(6);
    doc.text(`$${totalMoney.toFixed(2)}`, contentXDinero + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
    contentXDinero += productColumnWidth;
  });
  for (const productId in productMoneyTotalsDesglose) {
    if (!first6Products.some(p => p.id === productId)) {
      totalVentaOtros += productMoneyTotalsDesglose[productId];
    }
  }
  doc.setFontSize(6);
  doc.text(`$${totalVentaOtros.toFixed(2)}`, contentXDinero + productColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
  contentXDinero += productColumnWidth;

   // Agregar columnas de Efectivo y Transferencia (montos) con números temporales encima
  // Efectivo
  doc.setFontSize(6);
  doc.text(`$${totalEfectivoResumen.toFixed(2)}`, contentXDinero + efectivoColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
  contentXDinero += efectivoColumnWidth;

  // Transferencia
  doc.setFontSize(6);
  doc.text(`$${totalTransferResumen.toFixed(2)}`, contentXDinero + transferColumnWidth / 2, y + rowHeight / 2 + 2, { align: 'center' }); // Solo monto, centrado verticalmente
  contentXDinero += transferColumnWidth;

  // Total general del desglose con número temporal encima y alineado a la derecha
  doc.setFontSize(6);
  doc.text(`$${String(Number(total.toFixed(2)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}`, pageWidth - margin - 3, y + rowHeight / 2 + 2, { align: 'right' }); // Monto total alineado a la derecha y centrado verticalmente, ajustada la posición X

  y += rowHeight + 10; // Ajustar el avance de Y después de las dos filas de totales

  // Pie de página centrado con numeración
  const totalPages = contentPageCount;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Guardar el PDF
  doc.save(`reporte-diario-${date}.pdf`);
}

export function exportDailyReportToExcel(config: BusinessConfig) {
  const { sales, total, products, date } = getDailySalesReport();
  
  // Estructura de datos para la hoja de Resumen del Día
  const resumenData = [
    ['Producto', 'Cantidad', 'Total'],
    ...products.map(p => [p.name, String(p.quantity), p.total.toFixed(2)])
  ];
  resumenData.push(['TOTAL', '', total.toFixed(2)]);

  // Estructura de datos para la hoja de Ventas por Mesa (Detalle)
  const desgloseData = [
    ['Mesa', 'Hora', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Método']
  ];
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const menuItem = getMenu().find(m => m.id === item.id); // Obtener el menú dentro del loop si es necesario o pasarlo como argumento
      const nombre = menuItem?.name || '';
      const cantidad = String(item.quantity);
      // Calcular precio unitario usando el precio del menú si está disponible, o inferirlo
      const precioUnitario = menuItem ? menuItem.price : (item.quantity > 0 ? sale.total / sale.items.reduce((sum, i) => sum + i.quantity, 0) : 0);
      const precioUnitarioStr = precioUnitario.toFixed(2);
      const totalItem = (precioUnitario * item.quantity).toFixed(2);
      const paymentMethod = getShortPaymentMethod(sale.paymentMethod);
      desgloseData.push([
        sale.tableNameAtSale || `Mesa ${sale.tableNumber}`, // Usar tableNameAtSale si existe
        new Date(sale.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        nombre,
        cantidad,
        precioUnitarioStr,
        totalItem,
        paymentMethod
      ]);
    });
  });

  // Crear libro y hojas
  const wb = XLSX.utils.book_new();
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  const wsDesglose = XLSX.utils.aoa_to_sheet(desgloseData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  XLSX.utils.book_append_sheet(wb, wsDesglose, 'Ventas por Mesa');

  // Descargar archivo
  const baseFileName = config.excelFileName || 'Reporte_Diario_Ventas'; // Usar nombre configurable o el por defecto
  const fileName = `${baseFileName}-${date}.xlsx`; // Concatenar fecha
  XLSX.writeFile(wb, fileName);
}

// Función auxiliar para obtener los 10 productos más vendidos (general)
function getTop10Products(products: { id: string; name: string; quantity: number; total: number }[]): { id: string; name: string; quantity: number; total: number }[] {
  return [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 10);
}

// Función auxiliar para obtener el nombre corto del método de pago
const getShortPaymentMethod = (method: string | undefined): string => {
  switch (method) {
    case 'cash':
      return 'Efec';
    case 'transfer':
      return 'Transf';
    case 'card':
      return 'Tarjeta';
    case 'mixed':
      return 'Mixto';
    default:
      return '-';
  }
};