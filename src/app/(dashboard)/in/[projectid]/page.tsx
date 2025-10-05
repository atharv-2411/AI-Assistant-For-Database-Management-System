"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SchemaBoard from '@/components/board';
import useInspectorStore from '@/stores/inspector';
import useFlowStore from '@/stores/flow';
import { ConnectivityModal } from '@/components/board/components/connectivity-modal';
import { Database } from 'lucide-react';
import React from 'react'

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

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectid: string }>
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbType, setDbType] = useState<'mysql' | 'postgresql'>('mysql');
  const { mainSchemaText, setMainSchemaText, resetStore } = useInspectorStore();
  const { flowNodes, flowEdges, setFlowNodes, setFlowEdges } = useFlowStore();

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
    
    // Reset stores before loading new project
    resetStore();
    setFlowNodes([]);
    setFlowEdges([]);
    
    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    let foundProject = allProjects.find((p: Project) => p.id === projectId);
    
    // Create new project if it doesn't exist and projectId is "new"
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
      
      // Update URL to use the actual project ID
      router.replace(`/in/${newProject.id}`);
    }
    
    if (!foundProject || foundProject.userId !== userData.id) {
      router.push("/");
      return;
    }
    
    // Load saved project state after a brief delay to ensure stores are reset
    setTimeout(() => {
      if (foundProject.schema) {
        setMainSchemaText(foundProject.schema);
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

  // Save project state when data changes
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
      }, 1000); // Debounce saves
      
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
  
  return (
    <div className='flex-1 flex flex-col'>
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-white font-semibold">{project.name}</h1>
          <p className="text-gray-400 text-sm">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setDbType('mysql'); setShowDbModal(true); }}
            className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
          >
            <Database size={14} />
            MySQL
          </button>
          <button
            onClick={() => { setDbType('postgresql'); setShowDbModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
          >
            <Database size={14} />
            PostgreSQL
          </button>
        </div>
      </div>
      
      <SchemaBoard />
      
      <ConnectivityModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
        type={dbType}
      />
    </div>
  );
}