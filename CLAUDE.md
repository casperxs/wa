# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a React + TypeScript application for processing Mexican PDF invoices with OCR capabilities. The main application is located in the `invoice-processor/` directory.

### Core Architecture

- **Frontend Framework**: React 19 with TypeScript and Vite
- **State Management**: Zustand store (`src/store/useInvoiceStore.ts`)
- **UI Framework**: TailwindCSS with Lucide React icons
- **PDF Processing**: PDF.js with React-PDF for rendering
- **OCR Engine**: Tesseract.js for scanned document processing
- **Form Handling**: React Hook Form with Zod validation
- **Export Formats**: Excel (SheetJS), CSV (PapaParse), JSON, and pipe-delimited text

### Component Structure

The application follows a tab-based workflow with these main components:

- `FileUploader` - Drag & drop PDF file upload
- `PDFViewer` - PDF rendering with zoom/navigation
- `ProcessingPanel` - OCR and data extraction interface
- `DataEditor` - Manual data correction and validation
- `TemplateManager` - Customizable extraction templates by provider
- `ExportPanel` - Multi-format data export

### Key Services

- `ocrService.ts` - Tesseract.js OCR processing
- `pdfExtractor.ts` - PDF.js text extraction
- `exportService.ts` - Multi-format data export utilities

### Data Types

Core interfaces defined in `src/types/invoice.ts`:
- `InvoiceData` - Complete invoice structure with validation
- `Template` - Provider-specific extraction templates
- `ProcessingResult` - Batch processing results

## Development Commands

Working directory: `invoice-processor/`

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Code linting
npm run lint

# Preview production build
npm run preview
```

## Development Workflow

1. The app processes Mexican invoices requiring specific fields: RFC (tax ID), invoice number, date, totals, and line items
2. Supports both digital PDFs (text extraction) and scanned PDFs (OCR processing)
3. Template system allows custom extraction rules per provider
4. Batch processing handles multiple files simultaneously
5. Export supports Excel with provider tabs, CSV, JSON, and ERP-compatible pipe-delimited format

## Configuration Files

- `vite.config.ts` - Standard Vite configuration
- `eslint.config.js` - TypeScript ESLint with React hooks rules
- `tailwind.config.js` - TailwindCSS v4 configuration
- `tsconfig.json` - Composite TypeScript configuration
- `postcss.config.js` - PostCSS with TailwindCSS and Autoprefixer

## Deployment

The application is designed for static hosting (IIS, Apache, Nginx) and requires no backend. All processing happens client-side in the browser.