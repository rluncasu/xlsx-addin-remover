'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// import SwaggerUI from 'swagger-ui-react';
// import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(response => response.json())
      .then(data => {
        setSwaggerSpec(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load API documentation');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 mb-4">{error}</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Excel Addin Remover API Documentation
            </h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">API documentation is temporarily disabled during deployment setup.</p>
          <p className="text-sm text-gray-500">The following endpoints are available:</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/analyze-excel</code> - Analyze Excel file for addins</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/process-excel</code> - Remove selected addins from Excel file</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
