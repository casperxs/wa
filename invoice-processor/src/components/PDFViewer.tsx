import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const PDFViewer: React.FC = () => {
  const { currentFile } = useInvoiceStore();
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrl(null);
    }
  }, [currentFile]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(page => Math.min(numPages, page + 1));
  };

  const zoomIn = () => {
    setScale(scale => Math.min(2.0, scale + 0.1));
  };

  const zoomOut = () => {
    setScale(scale => Math.max(0.5, scale - 0.1));
  };

  if (!currentFile || !fileUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Selecciona un archivo PDF para visualizar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="bg-white rounded-lg shadow overflow-auto max-h-96">
        <div className="flex justify-center p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            }
            error={
              <div className="text-red-500 p-4 text-center">
                Error al cargar el PDF
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              }
            />
          </Document>
        </div>
      </div>
    </div>
  );
};