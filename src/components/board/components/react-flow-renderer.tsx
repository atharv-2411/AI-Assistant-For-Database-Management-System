"use client";

import React, { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Background, ReactFlow, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutGrid, Download } from 'lucide-react';

import ELK from 'elkjs/lib/elk.bundled.js';

import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { TableNode } from '@/types/renderer';

import '@xyflow/react/dist/style.css';
import '../css/board.css';
import useInspectorStore from '@/stores/inspector'; // ✅ SIMPLIFIED: Removed unused imports

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.spacing.nodeNode': '150',
  'elk.layered.spacing.nodeNodeBetweenLayers': '200',
  'elk.direction': 'RIGHT',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
  'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
};

type NodeRendererProps = {
  nodes: TableNode[],
  edges: Edge[],
}

export default function NodeRenderer({
  nodes: i__nodes,
  edges: i__edges,
}: NodeRendererProps) {
  const params = useParams();
  const projectId = params?.projectid as string;

  const [nodes, setNodes, onNodesChange] = useNodesState(i__nodes);
  const [edges, setEdges] = useEdgesState(i__edges);

  const { mainSchemaText } = useInspectorStore();

  // Assign nodes and edge and auto layout them
  useEffect(() => {
    setNodes(i__nodes);
    setEdges(i__edges);

    handleAutoLayout(i__nodes, i__edges);
  }, [i__nodes, i__edges]);

  const getNodeDimensions = (node: TableNode) => ({
    width: 280,
    height: 50 + node.data.schema.length * 30
  });

  const handleAutoLayout = useCallback(async (nodes: TableNode[], edges: Edge[]) => {
    const elkGraph = {
      id: "root",
      children: nodes.map((node) => ({
        id: node.id,
        ...getNodeDimensions(node),
        // Add ports for better edge routing
        ports: node.data.schema.map((field) => {
          return {
            id: `${node.id}-${field.title}`,
            properties: {
              side: "RIGHT",
            }
          };
        })
      })),
      edges: edges.map((edge) => {
        return {
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        }
      })
    };

    try {
      const layoutGraph = await elk.layout(elkGraph, { layoutOptions: elkOptions });
      
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          // Add some offset to center the layout
          position: {
            x: layoutGraph.children?.find((n) => n.id === node.id)?.x ?? 0 + 100,
            y: layoutGraph.children?.find((n) => n.id === node.id)?.y ?? 0 + 50
          }
        }))
      );
      
    } catch (error) {
      console.error('Layout calculation failed:', error);
    }

  }, [nodes, edges, setNodes]);
  
  // Auto layout items in the beggining
  useEffect(() => {
    handleAutoLayout(nodes, edges);
  }, []);

  // ✅ ONLY: Download function
  const downloadDiagram = async () => {
    try {
      const { toPng } = await import('html-to-image');
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
        skipFonts: true,
        filter: (node) => {
          return !node.classList?.contains('react-flow__controls') && 
                 !node.classList?.contains('react-flow__minimap');
        }
      });

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
    }
  };

  return (
    <>
      <ReactFlow
        colorMode='dark'
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        nodeTypes={{
          databaseSchema: DatabaseSchemaNode
        }}
        nodesDraggable
      >
        {!edges.length && !nodes.length && (
          <div className="absolute h-full w-full flex items-center justify-center text-gray-500 text-4xl font-mono font-bold">
            Ask, Query, Analyze – Instantly.
          </div>
        )}
        <Background color='#fff2' bgColor='var(--board-default-background)' size={2} gap={20} />
        <Controls position='bottom-left' className='-translate-y-8'/>
      </ReactFlow>
      
      {/* ✅ CLEAN: Only Download and Auto Layout buttons */}
      <div className='absolute top-4 right-4 flex flex-row-reverse items-center gap-2'>
        {/* Auto Layout Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                asChild
                variant="secondary"
                onClick={() => handleAutoLayout(nodes, edges)}
                className="px-3 py-2 rounded-md flex items-center justify-center gap-2"
              >
                <div>
                  <LayoutGrid />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent className='bg-white text-primary'>
                Auto Layout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className='border-e-2 border-gray-500'></div>
        
        {/* ✅ ONLY: Download PNG Button (shows when schema exists) */}
        <div className={`flex gap-2 ${mainSchemaText.length > 0 ? "opacity-1 -translate-y-0" : "opacity-0 -translate-y-5"} transition-all`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={downloadDiagram}
                  className="px-3 py-2 rounded-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent className='bg-white text-primary'>
                Download PNG
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  )
}
