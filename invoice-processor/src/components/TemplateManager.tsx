import React, { useState } from 'react';
import { Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import type { Template } from '../types/invoice';
import { useInvoiceStore } from '../store/useInvoiceStore';

export const TemplateManager: React.FC = () => {
  const { templates, addTemplate, selectedTemplate, selectTemplate } = useInvoiceStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '',
    providerRfc: '',
    fieldMappings: {}
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name?.trim()) {
      alert('El nombre de la plantilla es requerido');
      return;
    }

    const template: Template = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      providerRfc: newTemplate.providerRfc || undefined,
      fieldMappings: newTemplate.fieldMappings || {},
      validationRules: {},
      createdAt: new Date()
    };

    addTemplate(template);
    setNewTemplate({ name: '', providerRfc: '', fieldMappings: {} });
    setIsCreating(false);
  };

  const handleEditTemplate = (template: Template) => {
    // TODO: Implement template editing functionality
    console.log('Edit template:', template);
  };


  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
      // In a real app, you'd remove from store
      console.log('Delete template:', templateId);
    }
  };

  const exportTemplate = (template: Template) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `plantilla_${template.name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        template.id = `template-${Date.now()}`;
        template.createdAt = new Date();
        addTemplate(template);
      } catch {
        alert('Error al importar la plantilla. Verifica que el archivo sea válido.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const defaultTemplates = [
    {
      id: 'cfdi-generico',
      name: 'CFDI Genérico',
      description: 'Plantilla estándar para facturas CFDI mexicanas',
      fields: ['Folio', 'Fecha', 'RFC Emisor', 'RFC Receptor', 'Total']
    },
    {
      id: 'servicios-profesionales',
      name: 'Servicios Profesionales',
      description: 'Para facturas de servicios profesionales',
      fields: ['Número', 'Serie', 'Fecha', 'Cliente', 'Honorarios']
    },
    {
      id: 'venta-productos',
      name: 'Venta de Productos',
      description: 'Para facturas de productos con partidas detalladas',
      fields: ['Factura', 'Fecha', 'Cliente', 'Productos', 'Cantidades', 'Precios']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Plantillas de Extracción
          </h2>
          <div className="flex space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={importTemplate}
              className="hidden"
              id="import-template"
            />
            <label
              htmlFor="import-template"
              className="btn-secondary flex items-center space-x-2 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Importar</span>
            </label>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Plantilla</span>
            </button>
          </div>
        </div>

        {/* Create New Template Form */}
        {isCreating && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">Crear Nueva Plantilla</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Plantilla
                </label>
                <input
                  type="text"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ej. Factura CFE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFC del Proveedor (Opcional)
                </label>
                <input
                  type="text"
                  value={newTemplate.providerRfc || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, providerRfc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ABC123456789"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTemplate({ name: '', providerRfc: '', fieldMappings: {} });
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTemplate}
                className="btn-primary"
              >
                Crear Plantilla
              </button>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Plantillas Personalizadas</h3>
          
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tienes plantillas personalizadas</p>
              <p className="text-sm">Crea una nueva plantilla para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportTemplate(template);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {template.providerRfc && (
                    <p className="text-sm text-gray-600 mb-2">
                      RFC: {template.providerRfc}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Creada: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                  {selectedTemplate?.id === template.id && (
                    <div className="mt-2 text-sm text-primary-600">
                      ✓ Plantilla seleccionada
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default Templates */}
        <div className="mt-8 space-y-4">
          <h3 className="font-medium text-gray-900">Plantillas Predefinidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer"
              >
                <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="text-xs text-gray-500">
                  <strong>Campos:</strong> {template.fields.join(', ')}
                </div>
                <button
                  onClick={() => {
                    // Create template from default
                    const newTemplate: Template = {
                      id: `template-${Date.now()}`,
                      name: template.name,
                      fieldMappings: {},
                      createdAt: new Date()
                    };
                    addTemplate(newTemplate);
                  }}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                >
                  Usar esta plantilla
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};