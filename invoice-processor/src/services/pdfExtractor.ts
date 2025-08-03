import * as pdfjs from 'pdfjs-dist';
import type { InvoiceData, InvoiceField, InvoiceItem, ProcessingResult } from '../types/invoice';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

export class PDFExtractor {
  private createEmptyField(id: string, label: string, required: boolean = true): InvoiceField {
    return {
      id,
      label,
      value: '',
      required,
      validated: false
    };
  }

  private createEmptyInvoiceData(): InvoiceData {
    return {
      numeroFactura: this.createEmptyField('numeroFactura', 'N° Factura'),
      fecha: this.createEmptyField('fecha', 'Fecha'),
      rfcEmisor: this.createEmptyField('rfcEmisor', 'RFC Emisor'),
      rfcReceptor: this.createEmptyField('rfcReceptor', 'RFC Receptor'),
      subtotal: this.createEmptyField('subtotal', 'Subtotal'),
      iva: this.createEmptyField('iva', 'IVA'),
      total: this.createEmptyField('total', 'Total'),
      formaPago: this.createEmptyField('formaPago', 'Forma de Pago'),
      partidas: []
    };
  }

  async extractFromFile(file: File): Promise<ProcessingResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const errors: string[] = [];

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        } catch (error) {
          errors.push(`Error extracting text from page ${pageNum}: ${error}`);
        }
      }

      if (!fullText.trim()) {
        return {
          success: false,
          errors: ['No text found in PDF. OCR may be required.'],
          confidence: 0
        };
      }

      // Process extracted text
      const invoiceData = this.processExtractedText(fullText);
      const confidence = this.calculateConfidence(invoiceData);

      return {
        success: true,
        data: invoiceData,
        errors,
        confidence
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Failed to process PDF: ${error}`],
        confidence: 0
      };
    }
  }

  private processExtractedText(text: string): InvoiceData {
    const invoiceData = this.createEmptyInvoiceData();
    
    // Common patterns for Mexican invoices
    const patterns = {
      numeroFactura: [
        /(?:factura|invoice|folio|número|no\.?)\s*:?\s*([A-Z0-9-]+)/i,
        /([A-Z]\d{1,4}-\d{1,6})/,
        /folio\s+fiscal\s*:?\s*([A-Z0-9-]+)/i
      ],
      fecha: [
        /(?:fecha|date)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i,
        /(\d{4}-\d{2}-\d{2})/
      ],
      rfcEmisor: [
        /(?:rfc\s+emisor|emisor\s+rfc)\s*:?\s*([A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2}[A0-9])/i,
        /emisor.*?([A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2}[A0-9])/i
      ],
      rfcReceptor: [
        /(?:rfc\s+receptor|receptor\s+rfc)\s*:?\s*([A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2}[A0-9])/i,
        /receptor.*?([A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2}[A0-9])/i
      ],
      subtotal: [
        /(?:subtotal|sub\s*total)\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
        /subtotal\s+([\d,]+\.?\d*)/i
      ],
      iva: [
        /(?:iva|i\.v\.a\.?)\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
        /impuestos?\s+trasladados?\s+iva\s+([\d,]+\.?\d*)/i
      ],
      total: [
        /(?:total|importe\s+total)\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
        /total\s+a\s+pagar\s+([\d,]+\.?\d*)/i
      ],
      formaPago: [
        /(?:forma\s+de\s+pago|método\s+de\s+pago)\s*:?\s*(.+?)(?:\n|$)/i,
        /pago\s+en\s+(.+?)(?:\n|$)/i
      ]
    };

    // Extract fields using patterns
    Object.entries(patterns).forEach(([fieldName, fieldPatterns]) => {
      for (const pattern of fieldPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const field = invoiceData[fieldName as keyof InvoiceData] as InvoiceField;
          if (field) {
            field.value = match[1].trim();
            field.validated = true;
            break;
          }
        }
      }
    });

    // Extract line items
    invoiceData.partidas = this.extractLineItems(text);

    return invoiceData;
  }

  private extractLineItems(text: string): InvoiceItem[] {
    const items: InvoiceItem[] = [];
    
    // Pattern for table-like structure
    const linePattern = /(\d+\.?\d*)\s+(.+?)\s+(\d+\.?\d*)\s+\$?\s*([\d,]+\.?\d*)/g;
    let match;
    let itemId = 1;

    while ((match = linePattern.exec(text)) !== null) {
      const [, cantidad, descripcion, precio, importe] = match;
      
      items.push({
        id: `item-${itemId++}`,
        descripcion: descripcion.trim(),
        cantidad: parseFloat(cantidad) || 1,
        precio: parseFloat(precio.replace(/,/g, '')) || 0,
        importe: parseFloat(importe.replace(/,/g, '')) || 0
      });
    }

    return items;
  }

  private calculateConfidence(data: InvoiceData): number {
    const requiredFields = [
      'numeroFactura', 'fecha', 'rfcEmisor', 'rfcReceptor', 
      'subtotal', 'iva', 'total', 'formaPago'
    ];
    
    let filledFields = 0;
    requiredFields.forEach(fieldName => {
      const field = data[fieldName as keyof InvoiceData] as InvoiceField;
      if (field && field.value.trim()) {
        filledFields++;
      }
    });

    const fieldConfidence = filledFields / requiredFields.length;
    const itemsConfidence = data.partidas.length > 0 ? 1 : 0;
    
    return Math.round((fieldConfidence * 0.8 + itemsConfidence * 0.2) * 100);
  }
}