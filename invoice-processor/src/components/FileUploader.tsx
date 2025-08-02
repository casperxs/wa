import React, { useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';

export const FileUploader: React.FC = () => {
  const { files, setFiles, setCurrentFile } = useInvoiceStore();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    setFiles([...files, ...droppedFiles]);
  }, [files, setFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      );
      setFiles([...files, ...selectedFiles]);
    }
  }, [files, setFiles]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const selectFile = (file: File) => {
    setCurrentFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Arrastra archivos PDF aquí
        </p>
        <p className="text-sm text-gray-500 mb-4">
          o haz clic para seleccionar archivos
        </p>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="btn-primary cursor-pointer inline-block"
        >
          Seleccionar Archivos
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            Archivos seleccionados ({files.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => selectFile(file)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};