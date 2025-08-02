import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { InvoiceData } from '../types/invoice';

export class ExportService {
  static exportToExcel(invoicesData: InvoiceData[], filename: string = 'facturas') {
    const workbook = XLSX.utils.book_new();
    
    // Group by provider RFC
    const groupedByProvider = this.groupByProvider(invoicesData);
    
    Object.entries(groupedByProvider).forEach(([providerRfc, invoices]) => {
      const sheetData = this.prepareDataForExport(invoices);
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      
      // Auto-size columns
      const maxWidths = this.calculateColumnWidths(sheetData);
      worksheet['!cols'] = maxWidths.map(width => ({ width }));
      
      // Add worksheet to workbook
      const sheetName = providerRfc || 'Sin_RFC';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
    });
    
    // Create summary sheet
    const summaryData = this.createSummaryData(invoicesData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    
    // Generate and download file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
    
    this.downloadFile(
      new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `${filename}.xlsx`
    );
  }

  static exportToCSV(invoicesData: InvoiceData[], filename: string = 'facturas') {
    const csvData = this.prepareDataForExport(invoicesData);
    const csv = Papa.unparse(csvData, {
      delimiter: ',',
      header: true
    });
    
    this.downloadFile(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
      `${filename}.csv`
    );
  }

  static exportToPipeDelimited(invoicesData: InvoiceData[], filename: string = 'facturas') {
    const data = this.prepareDataForExport(invoicesData);
    const headers = Object.keys(data[0] || {});
    
    let content = headers.join('|') + '\n';
    data.forEach(row => {
      const values = headers.map(header => row[header] || '');
      content += values.join('|') + '\n';
    });
    
    this.downloadFile(
      new Blob([content], { type: 'text/plain;charset=utf-8;' }),
      `${filename}.txt`
    );
  }

  static exportToJSON(invoicesData: InvoiceData[], filename: string = 'facturas') {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalInvoices: invoicesData.length,
      invoices: invoicesData.map(invoice => ({
        numeroFactura: invoice.numeroFactura.value,
        fecha: invoice.fecha.value,
        emisor: {
          rfc: invoice.rfcEmisor.value
        },
        receptor: {
          rfc: invoice.rfcReceptor.value
        },
        importes: {
          subtotal: parseFloat(invoice.subtotal.value) || 0,
          iva: parseFloat(invoice.iva.value) || 0,
          total: parseFloat(invoice.total.value) || 0
        },
        formaPago: invoice.formaPago.value,
        partidas: invoice.partidas.map(item => ({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precio: item.precio,
          importe: item.importe
        }))
      }))
    };
    
    this.downloadFile(
      new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }),
      `${filename}.json`
    );
  }

  private static groupByProvider(invoicesData: InvoiceData[]): Record<string, InvoiceData[]> {
    return invoicesData.reduce((groups, invoice) => {
      const rfc = invoice.rfcEmisor.value || 'Sin_RFC';
      if (!groups[rfc]) {
        groups[rfc] = [];
      }
      groups[rfc].push(invoice);
      return groups;
    }, {} as Record<string, InvoiceData[]>);
  }

  private static prepareDataForExport(invoicesData: InvoiceData[]) {
    const flatData: any[] = [];
    
    invoicesData.forEach(invoice => {
      // Base invoice data
      const baseData = {
        'Número Factura': invoice.numeroFactura.value,
        'Fecha': invoice.fecha.value,
        'RFC Emisor': invoice.rfcEmisor.value,
        'RFC Receptor': invoice.rfcReceptor.value,
        'Subtotal': parseFloat(invoice.subtotal.value) || 0,
        'IVA': parseFloat(invoice.iva.value) || 0,
        'Total': parseFloat(invoice.total.value) || 0,
        'Forma de Pago': invoice.formaPago.value,
      };

      // If no items, add base data only
      if (!invoice.partidas || invoice.partidas.length === 0) {
        flatData.push({
          ...baseData,
          'Descripción': '',
          'Cantidad': 0,
          'Precio Unitario': 0,
          'Importe': 0
        });
      } else {
        // Add row for each item
        invoice.partidas.forEach((item, index) => {
          flatData.push({
            ...(index === 0 ? baseData : this.createEmptyBaseData()),
            'Descripción': item.descripcion,
            'Cantidad': item.cantidad,
            'Precio Unitario': item.precio,
            'Importe': item.importe
          });
        });
      }
    });
    
    return flatData;
  }

  private static createEmptyBaseData() {
    return {
      'Número Factura': '',
      'Fecha': '',
      'RFC Emisor': '',
      'RFC Receptor': '',
      'Subtotal': '',
      'IVA': '',
      'Total': '',
      'Forma de Pago': '',
    };
  }

  private static createSummaryData(invoicesData: InvoiceData[]) {
    const summary = invoicesData.map(invoice => ({
      'RFC Emisor': invoice.rfcEmisor.value,
      'Número Factura': invoice.numeroFactura.value,
      'Fecha': invoice.fecha.value,
      'Total': parseFloat(invoice.total.value) || 0,
      'Partidas': invoice.partidas.length,
      'Estado Validación': this.getValidationStatus(invoice)
    }));

    // Add totals row
    const totalAmount = summary.reduce((sum, row) => sum + (row.Total || 0), 0);
    const totalInvoices = summary.length;
    
    summary.push({
      'RFC Emisor': 'TOTALES',
      'Número Factura': '',
      'Fecha': '',
      'Total': totalAmount,
      'Partidas': summary.reduce((sum, row) => sum + row.Partidas, 0),
      'Estado Validación': `${totalInvoices} facturas procesadas`
    });

    return summary;
  }

  private static getValidationStatus(invoice: InvoiceData): string {
    const requiredFields = [
      invoice.numeroFactura,
      invoice.fecha,
      invoice.rfcEmisor,
      invoice.rfcReceptor,
      invoice.total
    ];
    
    const validFields = requiredFields.filter(field => field.validated && field.value.trim()).length;
    const totalFields = requiredFields.length;
    
    if (validFields === totalFields) return 'Completo';
    if (validFields >= totalFields * 0.7) return 'Parcial';
    return 'Incompleto';
  }

  private static calculateColumnWidths(data: any[]): number[] {
    if (!data.length) return [];
    
    const headers = Object.keys(data[0]);
    return headers.map(header => {
      const maxLength = Math.max(
        header.length,
        ...data.map(row => String(row[header] || '').length)
      );
      return Math.min(maxLength + 2, 50); // Max width of 50 characters
    });
  }

  private static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}