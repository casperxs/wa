# Procesador de Facturas PDF

Sistema web para extracción inteligente de datos de facturas PDF mexicanas. Desarrollado con React + TypeScript, completamente funcional en el navegador.

## 🚀 Características Principales

### ✅ Procesamiento Inteligente
- **Extracción automática** de campos obligatorios (RFC, Folio, Fecha, Totales, Partidas)
- **OCR integrado** con Tesseract.js para PDFs escaneados
- **Validación en tiempo real** con corrección manual
- **Procesamiento por lotes** de múltiples archivos simultáneos

### ✅ Interfaz Moderna
- **Drag & Drop** de archivos PDF
- **Visualizador PDF integrado** con zoom y navegación
- **Editor visual** de datos extraídos con validación
- **Modo oscuro** opcional
- **Responsive design** (PC/móvil)

### ✅ Sistema de Plantillas
- **Plantillas personalizables** por proveedor
- **Importar/Exportar** configuraciones
- **Plantillas predefinidas** para casos comunes
- **Detección automática** de formatos

### ✅ Exportación Flexible
- **Excel (.xlsx)** con pestañas por proveedor + resumen
- **CSV** para importación en sistemas
- **Texto delimitado (|)** para integración ERP
- **JSON** para APIs
- **Previsualización** antes de descargar

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + Lucide Icons
- **PDF**: PDF.js + React-PDF
- **OCR**: Tesseract.js
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod
- **Exportación**: SheetJS + PapaParse

## 📦 Instalación y Uso

### Desarrollo Local
```bash
# Clonar repositorio
git clone <repo-url>
cd invoice-processor

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:5173
```

### Compilación para Producción
```bash
# Compilar aplicación
npm run build

# Los archivos estáticos se generan en /dist
# Subir contenido de /dist a tu servidor web
```

### Despliegue en IIS (Windows Server)

1. **Compilar aplicación**:
   ```bash
   npm run build
   ```

2. **Subir archivos**: Copiar todo el contenido de `/dist` a tu sitio web en IIS

3. **Configurar IIS**: 
   - Crear un nuevo sitio web o directorio virtual
   - Apuntar al directorio con los archivos compilados
   - Asegurar que el archivo `index.html` sea el documento predeterminado

4. **URL Rewriting** (opcional para rutas SPA):
   ```xml
   <!-- web.config -->
   <system.webServer>
     <rewrite>
       <rules>
         <rule name="React Routes" stopProcessing="true">
           <match url=".*" />
           <conditions logicalGrouping="MatchAll">
             <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
             <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
           </conditions>
           <action type="Rewrite" url="/" />
         </rule>
       </rules>
     </rewrite>
   </system.webServer>
   ```

## 🎯 Flujo de Uso

1. **Cargar Archivos**: Arrastra PDFs o selecciona archivos
2. **Procesar**: Extrae datos automáticamente (con OCR opcional)
3. **Editar**: Revisa y corrige datos extraídos
4. **Plantillas**: Guarda configuraciones para proveedores frecuentes
5. **Exportar**: Descarga en formato deseado (Excel/CSV/TXT/JSON)

## 📋 Campos Soportados

### Datos Básicos
- Número de Factura / Folio
- Fecha de emisión
- RFC Emisor
- RFC Receptor
- Forma de Pago

### Importes
- Subtotal
- IVA
- Total

### Partidas (Ilimitadas)
- Descripción
- Cantidad
- Precio Unitario
- Importe

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# Opcional: configurar CDN de PDF.js
VITE_PDFJS_CDN=https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/

# Opcional: configurar worker de Tesseract
VITE_TESSERACT_WORKER_URL=https://cdn.jsdelivr.net/npm/tesseract.js@4.1.4/
```

### Personalización de Templates
```javascript
// Ejemplo de template personalizado
const customTemplate = {
  name: "Proveedor XYZ",
  providerRfc: "XYZ123456789",
  fieldMappings: {
    numeroFactura: {
      regex: /FACTURA\s+(\w+)/i,
      position: { x: 100, y: 50, width: 200, height: 20 }
    },
    // ... más campos
  }
};
```

## 🚀 Características Avanzadas

### Procesamiento por Lotes
- Procesa múltiples PDFs simultáneamente
- Progreso en tiempo real
- Manejo de errores por archivo
- Resumen estadístico de resultados

### OCR Inteligente
- Preprocesamiento de imagen para mejor precisión
- Filtros de caracteres para español/números
- Fallback automático cuando extracción de texto falla
- Configurable por archivo

### Validación Inteligente
- Validación de RFC mexicano
- Formato de fechas
- Consistencia de importes
- Campos requeridos vs opcionales

## 🐛 Solución de Problemas

### Error: "No se puede cargar PDF"
- Verificar que el archivo no esté corrupto
- Algunos PDFs requieren OCR si no tienen texto seleccionable

### Error: "OCR muy lento"
- OCR es proceso intensivo, normal en PDFs grandes
- Considerar usar solo para archivos que fallan extracción normal
- Preprocesar imágenes mejora velocidad

### Error: "Exportación falla"
- Verificar que hay datos procesados
- Navegadores pueden bloquear descargas automáticas
- Permitir pop-ups para el sitio

## 📞 Soporte

Sistema desarrollado para entorno Windows Server + IIS + Plesk.

**Compatibilidad**:
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Móviles (iOS/Android)

**Requerimientos del servidor**:
- Servidor web estático (IIS, Apache, Nginx)
- No requiere backend (todo client-side)
- 50MB espacio en disco
- Conexión internet (para CDNs de librerías)

---

*Desarrollado para simplificar el procesamiento de facturas electrónicas mexicanas* 🇲🇽