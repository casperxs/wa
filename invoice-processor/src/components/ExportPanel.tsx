import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Database, Code } from 'lucide-react';
import { ExportService } from '../services/exportService';
import type { InvoiceData } from '../types/invoice';

interface ExportPanelProps {
  invoicesData: InvoiceData[];
  isVisible: boolean;
  onClose: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  invoicesData,
  isVisible,
  onClose
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv' | 'pipe' | 'json'>('excel');
  const [filename, setFilename] = useState('facturas_procesadas');
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      id: 'excel' as const,
      name: 'Excel (.xlsx)',
      description: 'Archivo Excel con pestañas por proveedor',
      icon: FileSpreadsheet,
      color: 'text-green-600'
    },
    {
      id: 'csv' as const,
      name: 'CSV (.csv)',
      description: 'Archivo separado por comas para importación',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 'pipe' as const,
      name: 'Texto Delimitado (.txt)',
      description: 'Archivo con separadores pipe (|) para ERP',
      icon: Database,
      color: 'text-purple-600'
    },
    {
      id: 'json' as const,
      name: 'JSON (.json)',
      description: 'Formato JSON para integración API',
      icon: Code,
      color: 'text-orange-600'
    }
  ];

  const handleExport = async () => {
    if (invoicesData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    setIsExporting(true);
    
    try {
      switch (selectedFormat) {
        case 'excel':
          ExportService.exportToExcel(invoicesData, filename);
          break;
        case 'csv':
          ExportService.exportToCSV(invoicesData, filename);
          break;
        case 'pipe':
          ExportService.exportToPipeDelimited(invoicesData, filename);
          break;
        case 'json':
          ExportService.exportToJSON(invoicesData, filename);
          break;
      }
      
      // Close panel after successful export
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos. Por favor intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isVisible) return null;

  const totalInvoices = invoicesData.length;
  const totalAmount = invoicesData.reduce((sum, invoice) => {
    return sum + (parseFloat(invoice.total.value) || 0);
  }, 0);

  const validatedInvoices = invoicesData.filter(invoice => 
    invoice.numeroFactura.validated && 
    invoice.fecha.validated && 
    invoice.total.validated
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Exportar Datos
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Resumen de Datos</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Facturas</p>
                <p className="font-semibold text-lg">{totalInvoices}</p>
              </div>
              <div>
                <p className="text-gray-600">Validadas</p>
                <p className="font-semibold text-lg text-green-600">{validatedInvoices}</p>
              </div>
              <div>
                <p className="text-gray-600">Importe Total</p>
                <p className="font-semibold text-lg">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-900">Seleccionar Formato</h3>
            <div className="grid grid-cols-1 gap-3">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                return (
                  <label
                    key={format.id}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedFormat === format.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.id}
                      checked={selectedFormat === format.id}
                      onChange={(e) => setSelectedFormat(e.target.value as any)}
                      className="sr-only"
                    />
                    <IconComponent className={`h-6 w-6 ${format.color} mr-3`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{format.name}</p>
                      <p className="text-sm text-gray-500">{format.description}</p>
                    </div>
                    {selectedFormat === format.id && (
                      <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none"></div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Filename */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Archivo
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="facturas_procesadas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se agregará automáticamente la extensión correspondiente
            </p>
          </div>

          {/* Export Options */}
          {selectedFormat === 'excel' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Opciones de Excel</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Se creará una pestaña por cada RFC emisor</li>
                <li>• Incluye una pestaña de resumen con totales</li>
                <li>• Las columnas se ajustan automáticamente</li>
              </ul>
            </div>
          )}

          {selectedFormat === 'pipe' && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Formato ERP</h4>
              <p className="text-sm text-purple-800">
                Archivo de texto con separadores pipe (|) optimizado para importación en sistemas ERP.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isExporting}
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || totalInvoices === 0}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};