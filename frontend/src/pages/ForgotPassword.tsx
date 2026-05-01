import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      // In a real app we wouldn't show the previewUrl, this is just for the demo
      setMessage(res.data.message + (res.data.previewUrl ? ` (Check your backend console for the Ethereal link, or click here: ${res.data.previewUrl})` : ''));
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to send reset email');
    }
  };

  return (
    <div className="flex items-center" style={{ justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top right, #1E293B, #0F172A)' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <KeyRound size={32} color="var(--warning)" />
          </div>
          <h2>Forgot Password?</h2>
          <p>Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {status === 'error' && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{message}</div>}
        {status === 'success' && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          {message.includes('http') ? (
            <span>We sent a reset link! <br/><a href={message.split('here: ')[1].replace(')', '')} target="_blank" rel="noreferrer" style={{color: 'var(--secondary)', fontWeight: 'bold'}}>Open Ethereal Email</a> to view it.</span>
          ) : message}
        </div>}

        {status !== 'success' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} placeholder="name@company.com" />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--warning)', color: '#000', fontWeight: 'bold' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
