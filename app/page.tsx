'use client';

import { useState, useRef } from 'react';
import { ExcelAddin } from '@/lib/excel-utils';
import { Button, Card, CardHeader, CardBody, CardFooter, Badge, Alert } from './components/ui';

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-800 mb-4 font-display tracking-wide">
            Excel Addin Remover
          </h1>
          <p className="text-lg text-gray-500 font-sans">
            Upload an Excel file, analyze its addins, and remove the ones you don&apos;t need
          </p>
        </div>

        {/* File Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800 font-display tracking-wide">Upload Excel File</h2>
          </CardHeader>
          
          <CardBody>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors bg-gray-50">
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
                  <p className="text-gray-500 mb-4 font-sans">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="primary"
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl text-success-500 mb-4">✅</div>
                  <p className="text-gray-800 font-medium mb-2 text-sm font-sans">{file.name}</p>
                  <p className="text-gray-500 mb-4 font-sans">
                    File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="space-x-3">
                    <Button
                      onClick={analyzeFile}
                      disabled={isAnalyzing}
                      variant={isAnalyzing ? 'primary' : 'secondary'}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Addins'}
                    </Button>
                    <Button
                      onClick={resetFile}
                      variant="secondary"
                    >
                      Choose Different File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" title="Success">
            {success}
          </Alert>
        )}

        {/* Addins List */}
        {addins.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 font-display tracking-wide">
                  Found Addins
                </h2>
                <Badge variant="primary">{addins.length}</Badge>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-3 mb-6">
                {addins.map((addin) => (
                  <div
                    key={addin.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedAddins.includes(addin.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedAddins.includes(addin.id)}
                          onChange={() => handleAddinToggle(addin.id)}
                          className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm font-sans">{addin.name}</h3>
                          <div className="text-sm text-gray-500 space-x-4 font-sans">
                            <span>Version: {addin.version}</span>
                            <span>Store: {addin.store}</span>
                            <span>Type: {addin.storeType}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-sans">
                            ID: {addin.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedAddins.length > 0 && (
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 font-sans">
                      {selectedAddins.length} addin(s) selected for removal
                    </p>
                    <Button
                      onClick={processFile}
                      disabled={isProcessing}
                      variant="danger"
                    >
                      {isProcessing ? 'Processing...' : `Remove ${selectedAddins.length} Addin(s)`}
                    </Button>
                  </div>
                </CardFooter>
              )}
            </CardBody>
          </Card>
        )}

        {/* API Documentation Link */}
        <div className="text-center">
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-600 underline font-sans"
          >
            View API Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
