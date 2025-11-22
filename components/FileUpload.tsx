import React, { useState, useCallback } from 'react';

interface Props {
  onUpload: (base64: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<Props> = ({ onUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).replace('data:application/pdf;base64,', '');
      onUpload(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
          SOW <span className="text-brand-600">Muncher</span>
        </h1>
        <p className="text-slate-600 text-lg">
          Autonomous SOW Compliance & Risk Analysis Agent
        </p>
      </div>

      <div 
        className={`relative p-12 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out
          ${dragActive ? 'border-brand-500 bg-brand-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-brand-400'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="application/pdf"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center pointer-events-none">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
              <p className="text-lg font-semibold text-brand-700">Analyzing Contract...</p>
              <p className="text-sm text-brand-600 mt-2">Comparing against Transurban & Mining Rulebooks</p>
            </>
          ) : (
            <>
              <div className="h-16 w-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-medium text-slate-800 mb-2">
                Drop your SOW PDF here
              </p>
              <p className="text-slate-500">
                or click to browse
              </p>
            </>
          )}
        </div>
      </div>
      
      {!isProcessing && (
        <p className="mt-6 text-sm text-slate-400">
          Powered by Gemini 3.0 Pro • Secure Analysis • Multimodal Reasoning
        </p>
      )}
    </div>
  );
};

export default FileUpload;