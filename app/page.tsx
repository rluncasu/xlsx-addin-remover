'use client';

import { useState, useRef } from 'react';
import { ExcelAddin } from '@/lib/excel-utils';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [addins, setAddins] = useState<ExcelAddin[]>([]);
  const [selectedAddins, setSelectedAddins] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError(null);
        setSuccess(null);
        setAddins([]);
        setSelectedAddins([]);
      } else {
        setError('Please select a valid .xlsx file');
        setFile(null);
      }
    }
  };

  const analyzeFile = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze file');
      }

      const data = await response.json();
      setAddins(data.addins);
      setSuccess(`Found ${data.addinCount} addin(s) in the file`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddinToggle = (addinId: string) => {
    setSelectedAddins(prev => 
      prev.includes(addinId) 
        ? prev.filter(id => id !== addinId)
        : [...prev, addinId]
    );
  };

  const processFile = async () => {
    if (!file || selectedAddins.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('selectedAddinIds', JSON.stringify(selectedAddins));

      const response = await fetch('/api/process-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      // Download the processed file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`Successfully removed ${selectedAddins.length} addin(s) and downloaded the processed file`);
      setSelectedAddins([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setAddins([]);
    setSelectedAddins([]);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Excel Addin Remover
          </h1>
          <p className="text-lg text-gray-600">
            Upload an Excel file, analyze its addins, and remove the ones you don&apos;t need
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Excel File</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!file ? (
              <div>
                <div className="text-6xl text-gray-400 mb-4">📊</div>
                <p className="text-gray-600 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            ) : (
              <div>
                <div className="text-6xl text-green-500 mb-4">✅</div>
                <p className="text-gray-800 font-medium mb-2">{file.name}</p>
                <p className="text-gray-600 mb-4">
                  File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="space-x-3">
                  <button
                    onClick={analyzeFile}
                    disabled={isAnalyzing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Addins'}
                  </button>
                  <button
                    onClick={resetFile}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Choose Different File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-500 text-xl mr-3">⚠️</div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-green-500 text-xl mr-3">✅</div>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Addins List */}
        {addins.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Found Addins ({addins.length})
            </h2>
            
            <div className="space-y-3 mb-6">
              {addins.map((addin) => (
                <div
                  key={addin.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedAddins.includes(addin.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedAddins.includes(addin.id)}
                        onChange={() => handleAddinToggle(addin.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{addin.name}</h3>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>Version: {addin.version}</span>
                          <span>Store: {addin.store}</span>
                          <span>Type: {addin.storeType}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {addin.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedAddins.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">
                    {selectedAddins.length} addin(s) selected for removal
                  </p>
                  <button
                    onClick={processFile}
                    disabled={isProcessing}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : `Remove ${selectedAddins.length} Addin(s)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Documentation Link */}
        <div className="text-center">
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View API Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
