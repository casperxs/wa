import { useState } from 'react';
import { FileText, Settings, Download, Moon, Sun } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { PDFViewer } from './components/PDFViewer';
import { DataEditor } from './components/DataEditor';
import { ProcessingPanel } from './components/ProcessingPanel';
import { TemplateManager } from './components/TemplateManager';
import { ExportPanel } from './components/ExportPanel';
import { useInvoiceStore } from './store/useInvoiceStore';
import './App.css';

type TabType = 'upload' | 'process' | 'edit' | 'templates' | 'export';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [darkMode, setDarkMode] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  
  const { 
    currentFile, 
    extractedData, 
    processingResults, 
    setExtractedData 
  } = useInvoiceStore();

  const tabs = [
    { id: 'upload' as const, label: 'Cargar Archivos', icon: FileText },
    { id: 'process' as const, label: 'Procesar', icon: Settings },
    { id: 'edit' as const, label: 'Editar Datos', icon: FileText },
    { id: 'templates' as const, label: 'Plantillas', icon: Settings },
    { id: 'export' as const, label: 'Exportar', icon: Download },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSaveData = (data: any) => {
    setExtractedData(data);
    setActiveTab('export');
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Procesador de Facturas
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-gray-600" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              {processingResults.length > 0 && (
                <button
                  onClick={() => setShowExportPanel(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar ({processingResults.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - PDF Viewer (when file is selected) */}
          {currentFile && (activeTab === 'upload' || activeTab === 'edit') && (
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <PDFViewer />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={currentFile && (activeTab === 'upload' || activeTab === 'edit') ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {activeTab === 'upload' && (
              <div className="space-y-8">
                <FileUploader />
                {currentFile && (
                  <div className="text-center">
                    <button
                      onClick={() => setActiveTab('process')}
                      className="btn-primary"
                    >
                      Continuar al Procesamiento
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'process' && <ProcessingPanel />}

            {activeTab === 'edit' && extractedData && (
              <DataEditor 
                data={extractedData} 
                onSave={handleSaveData}
              />
            )}

            {activeTab === 'templates' && <TemplateManager />}

            {activeTab === 'export' && (
              <div className="text-center py-12">
                {processingResults.length > 0 ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      ¡Procesamiento Completado!
                    </h2>
                    <p className="text-gray-600">
                      Se han procesado {processingResults.length} factura(s) exitosamente.
                    </p>
                    <button
                      onClick={() => setShowExportPanel(true)}
                      className="btn-primary flex items-center space-x-2 mx-auto"
                    >
                      <Download className="h-5 w-5" />
                      <span>Exportar Resultados</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      No hay datos para exportar
                    </h2>
                    <p className="text-gray-600">
                      Primero debes procesar algunas facturas.
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="btn-primary"
                    >
                      Comenzar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Export Panel Modal */}
      <ExportPanel
        invoicesData={processingResults.map(r => r.data).filter(Boolean) as any[]}
        isVisible={showExportPanel}
        onClose={() => setShowExportPanel(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Procesador de Facturas - Extracción inteligente de datos de facturas PDF</p>
            <p className="mt-1">
              Desarrollado para simplificar el procesamiento de facturas electrónicas mexicanas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;