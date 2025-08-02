import { createWorker, Worker } from 'tesseract.js';
import { ProcessingResult, InvoiceData } from '../types/invoice';

export class OCRService {
  private worker: Worker | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('spa', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Emit progress events if needed
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      await this.worker.setParameters({
        tessedit_pageseg_mode: '6', // Uniform block of text
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.,:-/&ÑÁÉÍÓÚáéíóúñü ',
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('No se pudo inicializar el motor OCR');
    }
  }

  async processImage(imageData: string | File | ImageData): Promise<string> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const { data: { text } } = await this.worker.recognize(imageData);
      return text;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Error al procesar la imagen con OCR');
    }
  }

  async processPDFPage(canvas: HTMLCanvasElement): Promise<string> {
    const imageData = canvas.toDataURL('image/png');
    return await this.processImage(imageData);
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  // Enhanced method that preprocesses image for better OCR results
  async processWithPreprocessing(canvas: HTMLCanvasElement): Promise<string> {
    const processedCanvas = this.preprocessImage(canvas);
    return await this.processPDFPage(processedCanvas);
  }

  private preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Create a new canvas for processing
    const processedCanvas = document.createElement('canvas');
    const processedCtx = processedCanvas.getContext('2d');
    if (!processedCtx) throw new Error('Could not get processed canvas context');

    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;

    // Copy original image
    processedCtx.drawImage(canvas, 0, 0);

    // Get image data
    const imageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;

    // Convert to grayscale and increase contrast
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      
      // Increase contrast (simple threshold)
      const enhanced = gray > 128 ? 255 : 0;
      
      data[i] = enhanced;     // Red
      data[i + 1] = enhanced; // Green
      data[i + 2] = enhanced; // Blue
      // Alpha stays the same
    }

    // Put the processed image data back
    processedCtx.putImageData(imageData, 0, 0);

    return processedCanvas;
  }
}

// Singleton instance
let ocrServiceInstance: OCRService | null = null;

export const getOCRService = (): OCRService => {
  if (!ocrServiceInstance) {
    ocrServiceInstance = new OCRService();
  }
  return ocrServiceInstance;
};