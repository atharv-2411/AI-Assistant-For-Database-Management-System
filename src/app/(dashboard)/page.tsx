"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Database, Calendar, Trash2, FolderOpen } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  userId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const userProjects = allProjects.filter((p: Project) => p.userId === userData.id);
    setProjects(userProjects);
  }, [router]);

  const createProject = () => {
    if (!newProject.name.trim()) return;
    
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      userId: currentUser.id
    };

    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    allProjects.push(project);
    localStorage.setItem("projects", JSON.stringify(allProjects));
    
    setProjects([...projects, project]);
    setNewProject({ name: "", description: "" });
    setShowCreateModal(false);
  };

  const deleteProject = (projectId: string) => {
    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const filtered = allProjects.filter((p: Project) => p.id !== projectId);
    localStorage.setItem("projects", JSON.stringify(filtered));
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const openProject = (projectId: string) => {
    router.push(`/in/${projectId}`);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {currentUser.name}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <Database className="text-blue-400" size={24} />
                <div className="flex gap-2">
                  <button
                    onClick={() => openProject(project.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FolderOpen size={16} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{project.description}</p>
              
              <div className="flex items-center text-xs text-gray-500 gap-4">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <Database className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-4">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-20"
                  placeholder="Enter project description"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createProject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}