import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Search, 
  Wallet, 
  PlusCircle, 
  ShoppingBag, 
  Layers, 
  User, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  Sliders,
  DollarSign,
  Globe
} from 'lucide-react';

export default function Navbar() {
  const { user, switchDemo, logout, isAdmin, isSeller } = useAuth();
  const { currency, setCurrency, currencies, formatPrice } = useCurrency();
  const { lang, setLang, t, isKhmer } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(10, 13, 20, 0.92)' }}>
      {/* Top Demo Bar for Instant Role Switching */}
      <div style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #172554 50%, #064e3b 100%)', padding: '6px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c7d2fe' }}>
          <Sparkles size={14} color="#38bdf8" />
          <span style={{ fontWeight: 600 }}>{t('roleSwitcher')}</span>
          <span style={{ color: '#94a3b8' }}>{t('roleSwitcherDesc')}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => switchDemo('buyer')}
            style={{ 
              background: user?.role === 'buyer' ? '#4f46e5' : 'rgba(255,255,255,0.1)', 
              color: 'white', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
              border: user?.role === 'buyer' ? '1px solid #818cf8' : 'none', cursor: 'pointer' 
            }}
          >
            {t('buyerRole')}
          </button>
          <button 
            onClick={() => switchDemo('seller')}
            style={{ 
              background: user?.role === 'seller' ? '#059669' : 'rgba(255,255,255,0.1)', 
              color: 'white', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
              border: user?.role === 'seller' ? '1px solid #34d399' : 'none', cursor: 'pointer' 
            }}
          >
            {t('sellerRole')}
          </button>
          <button 
            onClick={() => switchDemo('admin')}
            style={{ 
              background: user?.role === 'admin' ? '#dc2626' : 'rgba(255,255,255,0.1)', 
              color: 'white', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
              border: user?.role === 'admin' ? '1px solid #f87171' : 'none', cursor: 'pointer' 
            }}
          >
            {t('adminRole')}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', gap: '20px' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AccGlobal
            </div>
            <div style={{ fontSize: '0.68rem', color: '#06b6d4', fontWeight: 600, letterSpacing: '0.5px' }}>
              {t('escrowMarketplace')}
            </div>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '380px', position: 'relative' }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 14px 10px 42px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '9999px',
              color: 'white',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border 0.2s'
            }}
          />
        </form>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <Layers size={17} />
            <span>{t('navMarketplace')}</span>
          </Link>

          {isSeller && (
            <Link to="/seller-studio" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', fontWeight: 600, color: '#34d399' }}>
              <PlusCircle size={17} />
              <span>{t('navSellerStudio')}</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', fontWeight: 600, color: '#fb7185' }}>
              <Sliders size={17} />
              <span>{t('navAdmin')}</span>
            </Link>
          )}

          <Link to="/my-orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <ShoppingBag size={17} />
            <span>{t('navMyOrders')}</span>
          </Link>

          {/* Language Switcher (1-Click Toggle + Dropdown) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
              className="btn btn-outline btn-sm"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderColor: 'rgba(99, 102, 241, 0.4)',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#c7d2fe',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Click to toggle language"
            >
              <Globe size={14} color="#38bdf8" />
              <span>{lang === 'en' ? '🇰🇭 ភាសាខ្មែរ' : '🇬🇧 English'}</span>
            </button>
          </div>

          {/* Multi-Currency Dropdown */}
          <div style={{ position: 'relative' }}>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {Object.entries(currencies).map(([code, meta]) => (
                <option key={code} value={code} style={{ background: '#111827', color: 'white' }}>
                  {meta.flag} {code} ({meta.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* User Wallet Pill */}
          <Link to="/wallet" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(99, 102, 241, 0.12)', 
            border: '1px solid rgba(99, 102, 241, 0.3)', 
            padding: '7px 14px', 
            borderRadius: '9999px',
            color: '#a5b4fc',
            fontSize: '0.88rem',
            fontWeight: 700
          }}>
            <Wallet size={16} color="#818cf8" />
            <span>{formatPrice(user?.walletBalance || 0)}</span>
          </Link>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', color: 'white' }}
            >
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                alt="Avatar" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #6366f1' }}
              />
              <ChevronDown size={14} color="var(--text-dim)" />
            </button>

            {profileOpen && (
              <div 
                className="glass-panel" 
                style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: '48px', 
                  width: '230px', 
                  padding: '12px', 
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onClick={() => setProfileOpen(false)}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{user?.email}</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${user?.role === 'admin' ? 'badge-rose' : user?.role === 'seller' ? 'badge-emerald' : 'badge-primary'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <Link to="/wallet" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                  <Wallet size={15} /> {t('myWalletTopup')}
                </Link>
                <Link to="/my-orders" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                  <ShoppingBag size={15} /> {t('purchasedAccounts')}
                </Link>
                <Link to="/seller-studio" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                  <PlusCircle size={15} /> {t('sellerInventory')}
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', color: '#fb7185' }}>
                    <Sliders size={15} /> {t('adminDashboard')}
                  </Link>
                )}
                <button 
                  onClick={logout} 
                  className="btn btn-outline btn-sm" 
                  style={{ justifyContent: 'flex-start', color: '#ef4444', marginTop: '6px' }}
                >
                  <LogOut size={15} /> {t('logout')}
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
