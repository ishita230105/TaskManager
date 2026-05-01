import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FolderKanban, CheckSquare, Activity, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const getStatusCount = (status: string) => {
    if (!stats?.tasksByStatus) return 0;
    const item = stats.tasksByStatus.find((s: any) => s.status === status);
    return item ? item._count : 0;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1>Welcome, {user?.name}</h1>
        <p>Here's an overview of your team's progress</p>
      </div>

      <div className="dashboard-grid">
        {/* Total Projects Card */}
        <div className="glass-card stat-card" onClick={() => navigate('/projects')}>
          <div className="stat-icon stat-icon-primary">
            <FolderKanban size={32} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalProjects || 0}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        {/* Total Tasks Card */}
        <div className="glass-card stat-card" onClick={() => navigate('/tasks')}>
          <div className="stat-icon stat-icon-secondary">
            <CheckSquare size={32} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalTasks || 0}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        {/* Active Tasks Card */}
        <div className="glass-card stat-card-static">
          <div className="stat-icon stat-icon-warning">
            <Activity size={32} />
          </div>
          <div>
            <div className="stat-value">{getStatusCount('IN_PROGRESS')}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        {/* Overdue Tasks Card */}
        {stats?.overdueTasksCount > 0 && (
          <div className="glass-card stat-card stat-card-overdue" onClick={() => navigate('/tasks')}>
            <div className="stat-icon stat-icon-danger">
              <Calendar size={32} />
            </div>
            <div>
              <div className="stat-value stat-value-danger">{stats.overdueTasksCount}</div>
              <div className="stat-label">Overdue Tasks</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3>Task Status Breakdown</h3>
        <div className="status-breakdown">
          <div className="status-box status-box-todo">
            <div className="status-value">{getStatusCount('TODO')}</div>
            <div className="status-label">To Do</div>
          </div>
          <div className="status-box status-box-progress">
            <div className="status-value">{getStatusCount('IN_PROGRESS')}</div>
            <div className="status-label">In Progress</div>
          </div>
          <div className="status-box status-box-done">
            <div className="status-value">{getStatusCount('DONE')}</div>
            <div className="status-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Recent Active Tasks List */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h3>Pending & In Progress Tasks</h3>
          <button className="btn btn-outline" onClick={() => navigate('/tasks')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            View All Tasks
          </button>
        </div>
        
        <div className="task-list">
          {stats?.recentActiveTasks && stats.recentActiveTasks.length > 0 ? (
            stats.recentActiveTasks.map((task: any) => (
              <div key={task.id} className="task-item">
                <div>
                  <h4 className="task-item-title">
                    {task.title}
                    {task.status === 'IN_PROGRESS' ? (
                      <span className="badge badge-progress" style={{ fontSize: '0.65rem' }}>In Progress</span>
                    ) : (
                      <span className="badge badge-todo" style={{ fontSize: '0.65rem' }}>To Do</span>
                    )}
                  </h4>
                  <div className="task-item-project">
                    Project: {task.project.name}
                  </div>
                </div>
                {task.dueDate && (
                  <div className="task-item-date">
                    <Calendar size={14} />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="task-list-empty">
              No pending tasks right now. Great job!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
