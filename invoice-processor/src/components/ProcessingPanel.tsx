import React, { useState } from 'react';
import { Play, Square, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { PDFExtractor } from '../services/pdfExtractor';
import type { ProcessingResult } from '../types/invoice';

export const ProcessingPanel: React.FC = () => {
  const {
    files,
    currentFile,
    isProcessing,
    setProcessing,
    addProcessingResult,
    setExtractedData,
    setCurrentFile
  } = useInvoiceStore();

  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(null);
  const [useOCR, setUseOCR] = useState(false);
  const [results, setResults] = useState<(ProcessingResult & { filename: string })[]>([]);

  const processFile = async (file: File): Promise<ProcessingResult & { filename: string }> => {
    const extractor = new PDFExtractor();
    
    try {
      // First try regular text extraction
      const result = await extractor.extractFromFile(file);
      
      // If text extraction failed or confidence is low, try OCR
      if ((!result.success || result.confidence < 50) && useOCR) {
        console.log('Attempting OCR fallback...');
        // OCR implementation would go here
        // For now, we'll just return the original result
      }
      
      return {
        ...result,
        filename: file.name
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Error processing ${file.name}: ${error}`],
        confidence: 0,
        filename: file.name
      };
    }
  };

  const processSingleFile = async () => {
    if (!currentFile) {
      alert('Por favor selecciona un archivo para procesar');
      return;
    }

    setProcessing(true);
    setCurrentlyProcessing(currentFile.name);
    setProcessingProgress(0);

    try {
      const result = await processFile(currentFile);
      addProcessingResult(result);
      setResults([result]);
      
      if (result.data) {
        setExtractedData(result.data);
      }
      
      setProcessingProgress(100);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
      setCurrentlyProcessing(null);
    }
  };

  const processBatch = async () => {
    if (files.length === 0) {
      alert('Por favor selecciona archivos para procesar');
      return;
    }

    setProcessing(true);
    setResults([]);
    setProcessingProgress(0);

    const batchResults: (ProcessingResult & { filename: string })[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentlyProcessing(file.name);
      
      try {
        const result = await processFile(file);
        batchResults.push(result);
        addProcessingResult(result);
        
        // Update progress
        setProcessingProgress(((i + 1) / files.length) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        batchResults.push({
          success: false,
          errors: [`Error processing ${file.name}: ${error}`],
          confidence: 0,
          filename: file.name
        });
      }
    }

    setResults(batchResults);
    setProcessing(false);
    setCurrentlyProcessing(null);
  };

  const stopProcessing = () => {
    setProcessing(false);
    setCurrentlyProcessing(null);
    setProcessingProgress(0);
  };

  const viewResult = (result: ProcessingResult & { filename: string }) => {
    if (result.data) {
      setExtractedData(result.data);
      // Find and set the corresponding file as current
      const file = files.find(f => f.name === result.filename);
      if (file) {
        setCurrentFile(file);
      }
    }
  };

  const getStatusIcon = (result: ProcessingResult) => {
    if (!result.success) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (result.confidence >= 80) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (result.confidence >= 60) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-orange-500" />;
  };

  const getStatusText = (result: ProcessingResult) => {
    if (!result.success) return 'Error';
    if (result.confidence >= 80) return 'Excelente';
    if (result.confidence >= 60) return 'Bueno';
    return 'Requiere revisión';
  };

  return (
    <div className="space-y-6">
      {/* Processing Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Procesamiento de Facturas
        </h2>

        <div className="space-y-4">
          {/* OCR Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="use-ocr"
              checked={useOCR}
              onChange={(e) => setUseOCR(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="use-ocr" className="text-sm font-medium text-gray-700">
              Usar OCR para PDFs escaneados (más lento pero más preciso)
            </label>
          </div>

          {/* Processing Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={processSingleFile}
              disabled={isProcessing || !currentFile}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>Procesar Archivo Actual</span>
            </button>

            <button
              onClick={processBatch}
              disabled={isProcessing || files.length === 0}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>Procesar Lote ({files.length} archivos)</span>
            </button>

            {isProcessing && (
              <button
                onClick={stopProcessing}
                className="btn-secondary flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Detener</span>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {currentlyProcessing ? `Procesando: ${currentlyProcessing}` : 'Procesando...'}
                </span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resultados del Procesamiento ({results.length})
          </h3>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result)}
                  <div>
                    <p className="font-medium text-gray-900">{result.filename}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Confianza: {result.confidence}%</span>
                      <span>Estado: {getStatusText(result)}</span>
                      {result.errors.length > 0 && (
                        <span className="text-red-500">
                          {result.errors.length} error(es)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {result.success && result.data && (
                    <button
                      onClick={() => viewResult(result)}
                      className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </button>
                  )}
                  {result.errors.length > 0 && (
                    <button
                      onClick={() => {
                        alert(`Errores:\n${result.errors.join('\n')}`);
                      }}
                      className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Errores</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {results.length}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.success).length}
                </p>
                <p className="text-sm text-gray-600">Exitosos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.success && r.confidence < 80).length}
                </p>
                <p className="text-sm text-gray-600">Revisar</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {results.filter(r => !r.success).length}
                </p>
                <p className="text-sm text-gray-600">Errores</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};