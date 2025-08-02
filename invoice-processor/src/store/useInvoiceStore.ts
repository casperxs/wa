import { create } from 'zustand';
import { InvoiceData, Template, ProcessingResult } from '../types/invoice';

interface InvoiceStore {
  files: File[];
  currentFile: File | null;
  extractedData: InvoiceData | null;
  templates: Template[];
  selectedTemplate: Template | null;
  isProcessing: boolean;
  processingResults: ProcessingResult[];
  
  // Actions
  setFiles: (files: File[]) => void;
  setCurrentFile: (file: File | null) => void;
  setExtractedData: (data: InvoiceData | null) => void;
  addTemplate: (template: Template) => void;
  selectTemplate: (template: Template | null) => void;
  setProcessing: (processing: boolean) => void;
  addProcessingResult: (result: ProcessingResult) => void;
  clearResults: () => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  files: [],
  currentFile: null,
  extractedData: null,
  templates: [],
  selectedTemplate: null,
  isProcessing: false,
  processingResults: [],
  
  setFiles: (files) => set({ files }),
  setCurrentFile: (file) => set({ currentFile: file }),
  setExtractedData: (data) => set({ extractedData: data }),
  addTemplate: (template) => set((state) => ({ 
    templates: [...state.templates, template] 
  })),
  selectTemplate: (template) => set({ selectedTemplate: template }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  addProcessingResult: (result) => set((state) => ({
    processingResults: [...state.processingResults, result]
  })),
  clearResults: () => set({ processingResults: [] }),
}));