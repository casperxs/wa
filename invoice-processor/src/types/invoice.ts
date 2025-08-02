export interface InvoiceField {
  id: string;
  label: string;
  value: string;
  required: boolean;
  validated: boolean;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface InvoiceData {
  numeroFactura: InvoiceField;
  fecha: InvoiceField;
  rfcEmisor: InvoiceField;
  rfcReceptor: InvoiceField;
  subtotal: InvoiceField;
  iva: InvoiceField;
  total: InvoiceField;
  formaPago: InvoiceField;
  partidas: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  importe: number;
}

export interface ProcessingResult {
  success: boolean;
  data?: InvoiceData;
  errors: string[];
  confidence: number;
}

export interface Template {
  id: string;
  name: string;
  providerRfc?: string;
  fieldMappings: Record<string, {
    selector?: string;
    regex?: string;
    position?: { x: number; y: number; width: number; height: number };
  }>;
  validationRules?: Record<string, any>;
  createdAt: Date;
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'json';
  groupByProvider: boolean;
  includeValidationErrors: boolean;
  customFields?: string[];
}