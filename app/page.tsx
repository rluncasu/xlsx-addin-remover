'use client';

import { useState, useRef } from 'react';
import { ExcelAddin } from '@/lib/excel-utils';
import { Button, Card, CardHeader, CardBody, CardFooter, Badge, Alert, Modal } from './components/ui';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [addins, setAddins] = useState<ExcelAddin[]>([]);
  const [selectedAddins, setSelectedAddins] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
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

        {/* How to Use Card */}
        <div className="flex justify-center mb-6">
          <Card className="w-full max-w-[20rem]">
            <CardBody className="text-center">
              <Button
                onClick={() => setIsHelpOpen(true)}
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
              >
                How to Use
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 17 17">
                  <path d="M6.25136 6.18182C6.43304 5.66538 6.79162 5.2299 7.2636 4.95251C7.73559 4.67512 8.29051 4.57373 8.83009 4.66628C9.36967 4.75883 9.85909 5.03936 10.2117 5.45818C10.5642 5.877 10.7572 6.40709 10.7564 6.95455C10.7564 8.5 8.43818 9.27273 8.43818 9.27273M8.5 12.3636H8.50773M16.2273 8.5C16.2273 12.7677 12.7677 16.2273 8.5 16.2273C4.23234 16.2273 0.772727 12.7677 0.772727 8.5C0.772727 4.23234 4.23234 0.772727 8.5 0.772727C12.7677 0.772727 16.2273 4.23234 16.2273 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </CardBody>
          </Card>
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

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="How to Use Excel Addin Remover"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Important Notes:</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• DO NOT refresh the browser with the old copy at any time as it will import the addins from the file into browser storage</li>
              <li>• WA200006846 is the ID for the Prod Rockhopper addin</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Step-by-Step Instructions:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <p className="font-medium text-gray-800">Use the official uninstall procedure:</p>
                  <p className="text-gray-600 text-sm">Add-ins → More add-ins → My add-ins → Click three dots → Remove</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <p className="font-medium text-gray-800">Clear Office localStorage & sessionStorage</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <p className="font-medium text-gray-800">In Excel: File → Create a Copy → Download a Copy</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                <div>
                  <p className="font-medium text-gray-800">Close the Excel file</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">5</div>
                <div>
                  <p className="font-medium text-gray-800">Put the copy through this tool:</p>
                  <p className="text-gray-600 text-sm">https://xlsx-addin-remover.vercel.app/</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">6</div>
                <div>
                  <p className="font-medium text-gray-800">Press &quot;Analyze&quot;</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">7</div>
                <div>
                  <p className="font-medium text-gray-800">Select the addins to remove</p>
                  <p className="text-gray-600 text-sm">(WA200006846 is the ID for the Prod Rockhopper addin)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">8</div>
                <div>
                  <p className="font-medium text-gray-800">Press &quot;Remove&quot;</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">9</div>
                <div>
                  <p className="font-medium text-gray-800">Import the generated cleaned one and test it</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">10</div>
                <div>
                  <p className="font-medium text-gray-800">Delete your old Excel file without loading it into Excel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
