import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../api';

const ResetPassword = () => {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    try {
      await api.post('/auth/reset-password', { password, token, userId });
      setStatus('success');
      setMessage('Password reset successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Invalid or expired reset link');
    }
  };

  return (
    <div className="flex items-center" style={{ justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top right, #1E293B, #0F172A)' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <ShieldCheck size={32} color="var(--secondary)" />
          </div>
          <h2>Reset Password</h2>
          <p>Create a new strong password for your account.</p>
        </div>

        {status === 'error' && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{message}</div>}
        {status === 'success' && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{message}</div>}

        {status !== 'success' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} maxLength={15} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" required className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" minLength={8} maxLength={15} />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
