import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      login(response.data.token, response.data.user);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to register');
    }
  };

  return (
    <div className="flex items-center" style={{ justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top left, var(--surface), var(--background))' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(167, 139, 250, 0.15)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <UserPlus size={32} color="var(--secondary)" />
          </div>
          <h2>Create Account</h2>
          <p>Join the team and start collaborating</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} placeholder="name@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} maxLength={15} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--secondary)' }}>
            Sign Up
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
