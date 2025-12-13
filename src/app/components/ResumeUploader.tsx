'use client';

import { useState, useRef, useCallback } from 'react';

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  loading: boolean;
  error: string;
}

export default function ResumeUploader({ onUpload, loading, error }: ResumeUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Проверяем размер файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой (максимум 5MB)');
      return;
    }
    
    // Проверяем тип файла
    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      alert('Пожалуйста, загрузите текстовый файл (.txt)');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".txt,text/plain"
          onChange={handleChange}
        />
        
        {!selectedFile ? (
          <>
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg mb-2">Перетащите файл резюме сюда</p>
            <p className="text-sm text-gray-500 mb-4">или</p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Выбрать файл
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Поддерживаются текстовые файлы (.txt) до 5MB
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-lg">{selectedFile.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition
                ${loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Анализируем резюме...
                </span>
              ) : (
                'Проанализировать резюме'
              )}
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}