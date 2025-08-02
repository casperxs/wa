import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import type { InvoiceData, InvoiceItem } from '../types/invoice';
import { useInvoiceStore } from '../store/useInvoiceStore';

const invoiceSchema = z.object({
  numeroFactura: z.string().min(1, 'Número de factura requerido'),
  fecha: z.string().min(1, 'Fecha requerida'),
  rfcEmisor: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2}[A0-9]$/, 'RFC inválido'),
  rfcReceptor: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2}[A0-9]$/, 'RFC inválido'),
  subtotal: z.string().min(1, 'Subtotal requerido'),
  iva: z.string().min(1, 'IVA requerido'),
  total: z.string().min(1, 'Total requerido'),
  formaPago: z.string().min(1, 'Forma de pago requerida'),
});

interface DataEditorProps {
  data: InvoiceData;
  onSave: (data: InvoiceData) => void;
}

export const DataEditor: React.FC<DataEditorProps> = ({ data, onSave }) => {
  const { setExtractedData } = useInvoiceStore();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      numeroFactura: data.numeroFactura.value,
      fecha: data.fecha.value,
      rfcEmisor: data.rfcEmisor.value,
      rfcReceptor: data.rfcReceptor.value,
      subtotal: data.subtotal.value,
      iva: data.iva.value,
      total: data.total.value,
      formaPago: data.formaPago.value,
    },
    mode: 'onChange'
  });

  const [items, setItems] = React.useState<InvoiceItem[]>(data.partidas || []);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      descripcion: '',
      cantidad: 1,
      precio: 0,
      importe: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate importe when cantidad or precio changes
        if (field === 'cantidad' || field === 'precio') {
          updated.importe = updated.cantidad * updated.precio;
        }
        return updated;
      }
      return item;
    }));
  };

  const onSubmit = (formData: any) => {
    const updatedData: InvoiceData = {
      numeroFactura: { ...data.numeroFactura, value: formData.numeroFactura, validated: true },
      fecha: { ...data.fecha, value: formData.fecha, validated: true },
      rfcEmisor: { ...data.rfcEmisor, value: formData.rfcEmisor, validated: true },
      rfcReceptor: { ...data.rfcReceptor, value: formData.rfcReceptor, validated: true },
      subtotal: { ...data.subtotal, value: formData.subtotal, validated: true },
      iva: { ...data.iva, value: formData.iva, validated: true },
      total: { ...data.total, value: formData.total, validated: true },
      formaPago: { ...data.formaPago, value: formData.formaPago, validated: true },
      partidas: items
    };

    setExtractedData(updatedData);
    onSave(updatedData);
  };

  const FieldInput: React.FC<{
    name: keyof typeof invoiceSchema.shape;
    label: string;
    placeholder?: string;
  }> = ({ name, label, placeholder }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type="text"
              placeholder={placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors[name] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {!errors[name] && field.value && (
              <Check className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
            )}
            {errors[name] && (
              <X className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      />
      {errors[name] && (
        <p className="text-sm text-red-600">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Datos de la Factura
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldInput
              name="numeroFactura"
              label="Número de Factura"
              placeholder="A123-456789"
            />
            <FieldInput
              name="fecha"
              label="Fecha"
              placeholder="DD/MM/YYYY"
            />
            <FieldInput
              name="rfcEmisor"
              label="RFC Emisor"
              placeholder="ABC123456789"
            />
            <FieldInput
              name="rfcReceptor"
              label="RFC Receptor"
              placeholder="DEF987654321"
            />
            <FieldInput
              name="subtotal"
              label="Subtotal"
              placeholder="1000.00"
            />
            <FieldInput
              name="iva"
              label="IVA"
              placeholder="160.00"
            />
            <FieldInput
              name="total"
              label="Total"
              placeholder="1160.00"
            />
            <FieldInput
              name="formaPago"
              label="Forma de Pago"
              placeholder="Transferencia electrónica"
            />
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Partidas ({items.length})
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Partida</span>
              </button>
            </div>

            {items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importe
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Descripción del producto/servicio"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.precio}
                            onChange={(e) => updateItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          ${item.importe.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};