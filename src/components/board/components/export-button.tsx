"use client"
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, Code, FileDown, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ExportButtonProps {
  onExportPrisma: () => void;
  onExportSql: () => void;
  onExportMockData: () => void;
}

export default function ExportButton({ 
  onExportPrisma, 
  onExportSql, 
  onExportMockData
}: ExportButtonProps) {
  // ✅ GET PROJECT ID DIRECTLY FROM URL
  const params = useParams();
  const projectId = params?.projectid as string;

  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Image download function
  const downloadDiagram = async () => {
    setIsExporting(true);
    
    try {
      // Target the React Flow container directly
      const element = document.querySelector('.react-flow') as HTMLElement;
      
      if (!element) {
        alert('Diagram not found. Please make sure the diagram is loaded.');
        return;
      }

      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1,
        cacheBust: true,
        filter: (node) => {
          return !node.classList?.contains('react-flow__controls');
        }
      });

      // Create download
      const link = document.createElement('a');
      link.download = `schema-diagram-${projectId || Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Download successful!');
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Image Download Button */}
      <div
        onClick={downloadDiagram}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
      >
        <Download size={16} />
        {isExporting ? 'Downloading...' : 'Download PNG'}
      </div>
      
      {/* Code Export Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Code size={16} />
          Export Code
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  onExportPrisma();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FileDown size={14} />
                Export Prisma Schema
              </button>
              <button
                onClick={() => {
                  onExportSql();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FileDown size={14} />
                Export SQL
              </button>
              <button
                onClick={() => {
                  onExportMockData();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FileDown size={14} />
                Export Mock Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
