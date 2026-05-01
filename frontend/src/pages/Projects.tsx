import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Projects = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New project state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name, description });
      setShowModal(false);
      setName('');
      setDescription('');
      toast.success('Project created!');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
      console.error('Failed to create project', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Failed to delete project', error);
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <>
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Projects</h1>
          <p>Manage your team's projects</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {projects.map((project) => (
          <div key={project.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{project.name}</h3>
              {isAdmin && (
                <button onClick={() => handleDelete(project.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <p style={{ flex: 1 }}>{project.description || 'No description provided.'}</p>
            
            <button 
              className="btn btn-outline" 
              style={{ marginTop: '1rem', width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}
              onClick={() => navigate('/tasks', { state: { projectId: project.id } })}
            >
              View Tasks
            </button>
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Tasks: {project._count?.tasks || 0}</span>
              <span>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No projects found. Create one to get started!
          </div>
        )}
      </div>
      </div>

      {/* Modal for creating a project */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Redesign" />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the project..."></textarea>
              </div>
              <div className="flex justify-between gap-4" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
