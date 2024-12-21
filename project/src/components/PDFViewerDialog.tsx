import React, { useState } from 'react';

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  pdfUrl: string;
}

const PDFViewerDialog = ({ isOpen, onClose, bookTitle, pdfUrl }: PDFViewerDialogProps) => {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{bookTitle}</h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col h-[70vh]">
              <div className="flex justify-between items-center mb-4">
                <div className="space-x-2">
                  <button
                    onClick={() => setScale(prev => prev + 0.1)}
                    className="px-2 py-1 border rounded"
                  >
                    Zoom In
                  </button>
                  <button
                    onClick={() => setScale(prev => prev - 0.1)}
                    className="px-2 py-1 border rounded"
                  >
                    Zoom Out
                  </button>
                </div>
              </div>
              
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
              
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-md"
                style={{ transform: `scale(${scale})` }}
                onLoad={() => setLoading(false)}
                title={`PDF viewer for ${bookTitle}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewerDialog;