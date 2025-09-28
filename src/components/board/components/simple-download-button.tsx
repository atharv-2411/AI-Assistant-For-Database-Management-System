"use client"
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image';

interface SimpleDownloadButtonProps {
  projectId?: string;
}

export default function SimpleDownloadButton({ projectId }: SimpleDownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadDiagram = async () => {
    setIsExporting(true);
    
    try {
      // Target the React Flow container directly
      const element = document.querySelector('.react-flow') as HTMLElement;
      
      if (!element) {
        alert('Diagram not found. Please make sure the diagram is loaded.');
        return;
      }

      // Add CSS to ensure proper export
      const style = document.createElement('style');
      style.textContent = `.react-flow svg { overflow: visible !important; }`;
      document.head.appendChild(style);

      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1,
        cacheBust: true,
        filter: (node) => {
          // Filter out unnecessary elements
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

      // Clean up
      document.head.removeChild(style);
      
      console.log('✅ Download successful!');
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={downloadDiagram}
      disabled={isExporting}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <Download size={16} />
      {isExporting ? 'Downloading...' : 'Download PNG'}
    </button>
  );
}
