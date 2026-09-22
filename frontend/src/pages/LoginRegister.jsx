import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Sparkles, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginRegister() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, switchDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      navigate('/marketplace');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole) => {
    await switchDemo(targetRole);
    if (targetRole === 'admin') navigate('/admin');
    else if (targetRole === 'seller') navigate('/seller-studio');
    else navigate('/marketplace');
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '520px' }}>
      
      {/* 1-Click Fast Demo Login Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.4)', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 22, 35, 0.9) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
          <Sparkles size={16} /> 1-Click Fast Sandbox Access
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Instant login with pre-loaded wallets, realistic inventories, and admin powers:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            type="button" 
            onClick={() => handleQuickDemo('buyer')}
            className="btn btn-outline"
            style={{ justifyContent: 'space-between', borderColor: 'rgba(99, 102, 241, 0.3)' }}
          >
            <span>🛒 Buyer: Alex Gamer ($500 balance)</span>
            <ArrowRight size={15} />
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickDemo('seller')}
            className="btn btn-outline"
            style={{ justifyContent: 'space-between', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
          >
            <span>💼 Verified Seller: Vortex Goods (Inventory + Vault)</span>
            <ArrowRight size={15} />
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickDemo('admin')}
            className="btn btn-outline"
            style={{ justifyContent: 'space-between', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' }}
          >
            <span>👑 Platform Admin: AccGlobal Arbitration Command</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Main Auth Form */}
      <div className="glass-panel" style={{ padding: '36px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isRegister ? 'Join the global marketplace for verified accounts' : 'Login to access your wallet and orders'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required
                  placeholder="Your Name"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                required
                placeholder="name@example.com"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Primary Account Goal</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="form-select">
                <option value="buyer">I want to Buy accounts (Buyer)</option>
                <option value="seller">I want to Sell accounts (Merchant)</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)} 
            style={{ color: '#38bdf8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isRegister ? 'Sign In here' : 'Register now'}
          </button>
        </div>

      </div>

    </div>
  );
}
