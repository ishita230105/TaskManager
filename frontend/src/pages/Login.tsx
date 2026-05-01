import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="flex items-center" style={{ justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top right, var(--surface), var(--background))' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(251, 191, 36, 0.15)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <LogIn size={32} color="var(--primary)" />
          </div>
          <h2>Welcome Back</h2>
          <p>Login to manage your team tasks</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} placeholder="name@company.com" />
          </div>
          <div className="form-group">
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.75rem', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} maxLength={15} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
