"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useInspectorStore from '@/stores/inspector';
import useFlowStore from '@/stores/flow';
import { ConnectivityModal } from '@/components/board/components/connectivity-modal';
import { Database, ArrowLeft, Code, BarChart3, Table, MessageSquare, Sparkles, Download, Layout, Copy } from 'lucide-react';
import PromptBar from '@/components/board/components/prompt-bar';
import CodeEditor from '@/components/board/components/inspector/code-editor';
import MockDataGenerationSection from '@/components/board/components/inspector/mock-data-generation';
import NodeRenderer from '@/components/board/components/react-flow-renderer';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import useLoaderStore, { LOADER_TO_MAIN_CODE } from '@/stores/loader';
import Snackbar from '@/components/ui/snackbar';
import React from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  userId: string;
  schema?: string;
  nodes?: any[];
  edges?: any[];
}

type ViewMode = 'chat' | 'code' | 'diagram' | 'mockdata';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectid: string }>
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projectId, setProjectId] = useState("");
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbType, setDbType] = useState<'mysql' | 'postgresql'>('mysql');
  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const { mainSchemaText, setMainSchemaText, resetStore, buffering } = useInspectorStore();
  const { flowNodes, flowEdges, setFlowNodes, setFlowEdges } = useFlowStore();
  const { mainCodeLoadingStep } = useLoaderStore();

  // Mock data for diagram
  const mockNodes = [
    {
      "id": "coffee_types",
      "position": { "x": 0, "y": 0 },
      "type": "databaseSchema",
      "data": {
        "label": "Coffee Types",
        "schema": [
          { "title": "coffee_type_id", "type": "serial" },
          { "title": "name", "type": "varchar" },
          { "title": "description", "type": "text" },
          { "title": "price", "type": "numeric" }
        ]
      }
    },
    {
      "id": "employees",
      "position": { "x": 300, "y": 0 },
      "type": "databaseSchema",
      "data": {
        "label": "Employees",
        "schema": [
          { "title": "employee_id", "type": "serial" },
          { "title": "first_name", "type": "varchar" },
          { "title": "last_name", "type": "varchar" },
          { "title": "email", "type": "varchar" },
          { "title": "hire_date", "type": "date" }
        ]
      }
    },
    {
      "id": "orders",
      "position": { "x": 600, "y": 0 },
      "type": "databaseSchema",
      "data": {
        "label": "Orders",
        "schema": [
          { "title": "order_id", "type": "serial" },
          { "title": "employee_id", "type": "int" },
          { "title": "order_date", "type": "timestamp" }
        ]
      }
    }
  ];

  const mockEdges = [
    {
      "id": "orders-employees",
      "target": "orders",
      "source": "employees",
      "sourceHandle": "employee_id",
      "targetHandle": "employee_id",
      "type": "smoothstep",
      "animation": true
    }
  ];

  useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams.projectid);
    });
  }, [params]);

  useEffect(() => {
    if (!projectId) return;

    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(user);
    setCurrentUser(userData);

    resetStore();
    setFlowNodes([]);
    setFlowEdges([]);

    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    let foundProject = allProjects.find((p: Project) => p.id === projectId);

    if (!foundProject && projectId === "new") {
      const newProject: Project = {
        id: Date.now().toString(),
        name: "New Project",
        description: "A new database project",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        userId: userData.id
      };

      allProjects.push(newProject);
      localStorage.setItem("projects", JSON.stringify(allProjects));
      foundProject = newProject;
      router.replace(`/in/${newProject.id}`);
    }

    if (!foundProject || foundProject.userId !== userData.id) {
      router.push("/");
      return;
    }

    setTimeout(() => {
      if (foundProject.schema) {
        setMainSchemaText(foundProject.schema);
        setCurrentView('code');
      }
      if (foundProject.nodes && foundProject.nodes.length > 0) {
        setFlowNodes(foundProject.nodes);
      }
      if (foundProject.edges && foundProject.edges.length > 0) {
        setFlowEdges(foundProject.edges);
      }
    }, 100);

    setProject(foundProject);
  }, [router, projectId, setMainSchemaText, setFlowNodes, setFlowEdges]);

  useEffect(() => {
    if (project && projectId && (mainSchemaText || flowNodes.length || flowEdges.length)) {
      const saveTimeout = setTimeout(() => {
        const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const updatedProjects = allProjects.map((p: Project) =>
          p.id === project.id
            ? {
                ...p,
                schema: mainSchemaText,
                nodes: flowNodes,
                edges: flowEdges,
                lastModified: new Date().toISOString()
              }
            : p
        );
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [mainSchemaText, flowNodes, flowEdges, project, projectId]);

  if (!project || !currentUser) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mainSchemaText);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([mainSchemaText], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-schema.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAutoLayout = () => {
    const reactFlowInstance = document.querySelector('.react-flow');
    if (reactFlowInstance) {
      const fitViewButton = reactFlowInstance.querySelector('[data-testid="rf__controls-fitview"]');
      if (fitViewButton) {
        (fitViewButton as HTMLElement).click();
      }
    }
  };

  const handleDownloadDiagram = () => {
    import('html2canvas').then((html2canvas) => {
      const reactFlowElement = document.querySelector('.react-flow__renderer');
      if (reactFlowElement) {
        html2canvas.default(reactFlowElement as HTMLElement, {
          backgroundColor: '#111827',
          scale: 2,
          useCORS: true
        }).then((canvas: HTMLCanvasElement) => {
          const link = document.createElement('a');
          link.download = `${project.name}-diagram.png`;
          link.href = canvas.toDataURL();
          link.click();
        });
      }
    }).catch(() => {
      console.log('Screenshot functionality not available');
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <div className="h-full flex flex-col bg-gray-900">
            {/* Welcome Hero Section - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-8">
                {/* Hero Section */}
                <div className="text-center mb-12 mt-20">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full">
                      <Sparkles size={32} className="text-white" />
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4">
                    AI Database Schema Generator
                  </h1>
                  <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                    Describe your database requirements in natural language, and I'll generate the perfect SQL schema for you.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <Code className="text-blue-400 mb-3 mx-auto" size={24} />
                      <h3 className="text-white font-semibold mb-2">SQL Generation</h3>
                      <p className="text-gray-400 text-sm">Generate clean, optimized SQL schemas from natural language</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <BarChart3 className="text-green-400 mb-3 mx-auto" size={24} />
                      <h3 className="text-white font-semibold mb-2">Visual Diagrams</h3>
                      <p className="text-gray-400 text-sm">See your database structure in interactive flowcharts</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <Database className="text-purple-400 mb-3 mx-auto" size={24} />
                      <h3 className="text-white font-semibold mb-2">Mock Data</h3>
                      <p className="text-gray-400 text-sm">Generate realistic test data for your schemas</p>
                    </div>
                  </div>

                  {/* Example Prompts */}
                  <div className="mb-8">
                    <p className="text-gray-400 text-center mb-4">Try these examples:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg border border-gray-700 text-left text-gray-300 hover:text-white transition-all text-sm cursor-pointer">
                        "Create a blog database with posts, users, and comments"
                      </div>
                      <div className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg border border-gray-700 text-left text-gray-300 hover:text-white transition-all text-sm cursor-pointer">
                        "Design an e-commerce system with products, orders, and customers"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Bar - Fixed at Bottom */}
            <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700">
              <PromptBar />
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Generated SQL Schema</h2>
                <p className="text-sm text-gray-400">Edit your schema code and see changes reflected in real-time</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-white text-sm flex items-center gap-2 transition-colors"
                >
                  <Copy size={14} />
                  Copy
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white text-sm flex items-center gap-2 transition-colors"
                >
                  <Download size={14} />
                  Download SQL
                </button>
              </div>
            </div>
            
            {/* Code Editor - Scrollable */}
            <div className="flex-1 overflow-hidden bg-gray-900">
              <CodeEditor />
            </div>
          </div>
        );

      case 'diagram':
        return (
          <div className="h-full flex flex-col">
            {/* Compact Header - Smaller to give more space to diagram */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div>
                <h2 className="text-sm font-medium text-white">Database Diagram</h2>
                <p className="text-xs text-gray-400">Interactive visualization</p>
              </div>
              
              {/* Action Buttons - Properly positioned in header */}
              <div className="flex gap-2">
                <button
                  onClick={handleAutoLayout}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white text-xs flex items-center gap-2 transition-colors"
                >
                  <Layout size={12} />
                  Auto Layout
                </button>
                
                <button
                  onClick={handleDownloadDiagram}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-white text-xs flex items-center gap-2 transition-colors"
                >
                  <Download size={12} />
                  Download PNG
                </button>
              </div>
            </div>
            
            {/* Diagram - Maximum available space */}
            <div className="flex-1 overflow-hidden bg-gray-900 relative">
              <div className="absolute inset-0">
                <NodeRenderer 
                  nodes={flowNodes.length > 0 ? flowNodes : mockNodes} 
                  edges={flowEdges.length > 0 ? flowEdges : mockEdges}
                />
              </div>
            </div>
          </div>
        );

      case 'mockdata':
        return (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Mock Data Generator</h2>
                <p className="text-sm text-gray-400">Generate realistic test data for your database schema</p>
              </div>
            </div>
            
            {/* Mock Data Generator - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-900 p-6">
              <MockDataGenerationSection />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="border-l border-gray-600 pl-4">
            <h1 className="text-white font-semibold text-lg">{project.name}</h1>
            <p className="text-gray-400 text-sm">{project.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setDbType('mysql'); setShowDbModal(true); }}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-colors font-medium"
          >
            <Database size={16} />
            MySQL
          </button>
          <button
            onClick={() => { setDbType('postgresql'); setShowDbModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-colors font-medium"
          >
            <Database size={16} />
            PostgreSQL
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 px-6 border-b border-gray-700 flex-shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentView('chat')}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
              currentView === 'chat'
                ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
          >
            <MessageSquare size={16} />
            Chat
          </button>
          {mainSchemaText && (
            <>
              <button
                onClick={() => setCurrentView('code')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                  currentView === 'code'
                    ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Code size={16} />
                Code
              </button>
              <button
                onClick={() => setCurrentView('diagram')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                  currentView === 'diagram'
                    ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <BarChart3 size={16} />
                Diagram
              </button>
              <button
                onClick={() => setCurrentView('mockdata')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                  currentView === 'mockdata'
                    ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Table size={16} />
                Mock Data
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </div>

      {/* Modals and Loaders */}
      <ConnectivityModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
        type={dbType}
      />

      <MultiStepLoader
        loadingStates={LOADER_TO_MAIN_CODE}
        loading={buffering}
        value={mainCodeLoadingStep}
      />
      
      <Snackbar />
    </div>
  );
}
