
import React, { useState, useCallback, useRef } from 'react';
import { IconUploadCloud, IconFileText } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      alert("Por favor, selecione um arquivo PDF.");
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      onFileSelect(file);
      if(fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    } else {
      setSelectedFile(null);
       if(fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
      alert("Por favor, selecione um arquivo PDF.");
    }
  }, [onFileSelect]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl p-8 bg-slate-800 rounded-xl shadow-2xl transition-all duration-300 border border-slate-700">
      <div
        className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-lg cursor-pointer
                    ${dragOver ? 'border-sky-500 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}
                    transition-colors duration-200 ease-in-out p-6`}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Área de upload de arquivo PDF. Arraste e solte ou clique para selecionar."
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          aria-hidden="true"
        />
        <IconUploadCloud className={`w-20 h-20 mb-6 ${dragOver ? 'text-sky-400' : 'text-sky-500'} transition-colors duration-200`} />
        <p className={`mb-2 text-xl ${dragOver ? 'text-sky-300' : 'text-slate-200'} font-semibold`}>
          Arraste e solte seu PDF aqui
        </p>
        <p className={`text-md ${dragOver ? 'text-sky-400' : 'text-slate-400'}`}>ou clique para selecionar</p>
      </div>

      {selectedFile && (
        <div className="mt-8 p-5 bg-slate-700 rounded-lg border border-slate-600 flex items-center space-x-4 shadow-lg">
          <IconFileText className="w-8 h-8 text-sky-400 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="text-md font-medium text-slate-100 truncate" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <p className="text-sm text-slate-400">
              Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
