
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem } from '../types';
import { WATERMARK_TEXT } from '../constants';

export const generateQuotationPDF = (items: CartItem[], discount: number, userName: string): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- Branding ---
  doc.setFillColor(30, 64, 175); // Blue Header
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(250, 204, 21); // Yellow Text
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 50, 20);
  doc.text(`Prepared for: ${userName}`, pageWidth - 50, 26);

  // --- Calculations ---
  const subTotal = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const finalTotal = subTotal - discount;

  // --- Table ---
  const tableColumn = ["Item No.", "Description", "Model", "Qty", "MRP", "Total"];
  const tableRows: any[] = [];

  items.forEach(item => {
    const total = item.mrp * item.quantity;
    const itemData = [
      item.itemNo,
      item.description,
      item.model,
      item.quantity,
      item.mrp.toFixed(2),
      total.toFixed(2)
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: {
        fillColor: [30, 64, 175], // Blue header
        textColor: [255, 255, 255], // White text
        fontStyle: 'bold'
    },
    styles: {
        textColor: [0, 0, 0],
        fontSize: 9
    },
    alternateRowStyles: {
        fillColor: [240, 248, 255] // AliceBlue
    }
  });

  // --- Summary Section ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  doc.text(`Subtotal:`, pageWidth - 60, finalY);
  doc.text(`${subTotal.toFixed(2)}`, pageWidth - 20, finalY, { align: 'right' });
  
  doc.text(`Discount:`, pageWidth - 60, finalY + 6);
  doc.text(`-${discount.toFixed(2)}`, pageWidth - 20, finalY + 6, { align: 'right' });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Final Total:`, pageWidth - 60, finalY + 14);
  doc.text(`${finalTotal.toFixed(2)}`, pageWidth - 20, finalY + 14, { align: 'right' });

  // --- Watermark ---
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  const textWidth = doc.getTextWidth(WATERMARK_TEXT);
  doc.text(WATERMARK_TEXT, (pageWidth / 2) - (textWidth / 2), pageHeight - 10);

  const fileName = `Quotation_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
  
  // Return the data URI for uploading
  return doc.output('datauristring');
};
