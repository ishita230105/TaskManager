import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProjectId, setFilterProjectId] = useState<string>('ALL');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  const fetchTasksAndProjects = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data.data || tasksRes.data);
      const projectsData = projectsRes.data.data || projectsRes.data;
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setProjectId(projectsData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
  }, []);

  useEffect(() => {
    if (location.state?.projectId) {
      setFilterProjectId(location.state.projectId);
    }
  }, [location.state]);

  const displayedTasks = filterProjectId === 'ALL' 
    ? tasks 
    : tasks.filter(t => t.projectId === filterProjectId);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description,
        dueDate: dueDate || undefined,
        projectId
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      toast.success('Task created successfully!');
      fetchTasksAndProjects();
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Failed to create task', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasksAndProjects();
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Failed to delete task', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasksAndProjects();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('You are not authorized to update this task status');
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO': return <span className="badge badge-todo">To Do</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress">In Progress</span>;
      case 'DONE': return <span className="badge badge-done">Done</span>;
      default: return null;
    }
  };

  return (
    <>
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Tasks</h1>
          <p>Manage and track team tasks</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={projects.length === 0}>
            <Plus size={20} /> New Task
          </button>
        )}
      </div>

      {projects.length > 0 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Filter by Project:</label>
          <select 
            className="form-select" 
            style={{ width: '250px' }} 
            value={filterProjectId} 
            onChange={(e) => setFilterProjectId(e.target.value)}
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
      
      {projects.length === 0 && isAdmin && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--warning)' }}>
          Please create a project first before creating tasks.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayedTasks.map((task) => (
          <div key={task.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{task.title}</h3>
                {getStatusBadge(task.status)}
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>{task.description || 'No description'}</p>
              
              <div className="flex items-center gap-4" style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Project: <strong style={{ color: 'var(--text-main)' }}>{task.project.name}</strong></span>
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
                {task.assignee && (
                  <span>Assignee: <strong style={{ color: 'var(--text-main)' }}>{task.assignee.name}</strong></span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select 
                className="form-select" 
                style={{ width: 'auto', padding: '0.5rem' }}
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>

              {isAdmin && (
                <button onClick={() => handleDelete(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.5rem' }}>
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
        {displayedTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
            No tasks found.
          </div>
        )}
      </div>
    </div>

      {/* Modal for creating a task */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input type="text" required className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design Homepage" />
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select required className="form-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea className="form-input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="flex justify-between gap-4" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;
