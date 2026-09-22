import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import AccountCard from '../components/AccountCard';
import TrustBanner from '../components/TrustBanner';
import { 
  Gamepad2, 
  Share2, 
  Tv, 
  Briefcase, 
  Mail, 
  ShoppingBag, 
  ShieldCheck, 
  Zap, 
  Search, 
  Sparkles,
  TrendingUp,
  ArrowRight,
  Clock
} from 'lucide-react';

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [categorySummaries, setCategorySummaries] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [listingsRes, categoriesRes] = await Promise.all([
          api.getListings({ sort: 'popular' }),
          api.getCategoriesSummary()
        ]);
        if (listingsRes.success) setFeaturedListings(listingsRes.listings);
        if (categoriesRes.success) setCategorySummaries(categoriesRes.summary);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { name: 'Gaming', icon: <Gamepad2 size={24} color="#06b6d4" />, count: 'Steam, Valorant, Epic', bg: 'rgba(6, 182, 212, 0.1)' },
    { name: 'Social Media', icon: <Share2 size={24} color="#ec4899" />, count: 'TikTok, Instagram, FB', bg: 'rgba(236, 72, 153, 0.1)' },
    { name: 'Streaming', icon: <Tv size={24} color="#f59e0b" />, count: 'Netflix 4K, Spotify, YT', bg: 'rgba(245, 158, 11, 0.1)' },
    { name: 'Business', icon: <Briefcase size={24} color="#6366f1" />, count: 'Canva Pro, Adobe, AWS', bg: 'rgba(99, 102, 241, 0.1)' },
    { name: 'Email', icon: <Mail size={24} color="#10b981" />, count: 'Aged Gmail & Outlook', bg: 'rgba(16, 185, 129, 0.1)' },
    { name: 'Ecommerce', icon: <ShoppingBag size={24} color="#8b5cf6" />, count: 'Amazon US, eBay Stores', bg: 'rgba(139, 92, 246, 0.1)' }
  ];

  const filteredListings = activeTab === 'All' 
    ? featuredListings 
    : featuredListings.filter(l => l.category === activeTab);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '70px 0 50px 0', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '6px 18px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', marginBottom: '20px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span>{t('heroBadge')}</span>
            </div>

            <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '18px' }}>
              {t('heroTitle1')} <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('heroTitleHighlight')}</span>
            </h1>

            <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
              {t('heroSubtitle')}
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleHeroSearch} className="glass-panel" style={{ display: 'flex', padding: '8px', borderRadius: '9999px', maxWidth: '640px', margin: '0 auto 28px auto', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '16px', gap: '10px' }}>
                <Search size={20} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder={t('heroSearchPlaceholder')} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '1rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: '9999px' }}>
                {t('exploreBtn')}
              </button>
            </form>

            {/* Quick Chips */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <span>{t('trendingSearches')}</span>
              {['Steam CS2', 'Valorant Radiant', 'Netflix 4K', 'Canva Pro', 'Instagram 100k', 'Aged Gmail'].map((term, i) => (
                <Link 
                  key={i} 
                  to={`/marketplace?search=${encodeURIComponent(term)}`}
                  style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '9999px', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {term}
                </Link>
              ))}
            </div>

          </div>

          {/* Quick Metrics Counter */}
          <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', padding: '24px 32px', margin: '50px 0 0 0', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>$248,500+</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('statVolume')}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>100%</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('statGuarantee')}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>1,850+</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('statAccounts')}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>&lt; 60 Sec</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('statSpeed')}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Category Grid Section */}
      <section className="container" style={{ margin: '40px auto 60px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
              {t('exploreCategoryTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {t('exploreCategorySub')}
            </p>
          </div>
          <Link to="/marketplace" className="btn btn-outline btn-sm">
            {t('viewAllCategories')} <ArrowRight size={15} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
              className="glass-panel"
              style={{ 
                padding: '22px 18px', 
                borderRadius: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cat.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                  {cat.name}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {cat.count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Accounts Marketplace Preview */}
      <section className="container" style={{ margin: '60px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <TrendingUp size={16} /> {t('hotListingsBadge')}
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
              {t('featuredAccountsTitle')}
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Gaming', 'Social Media', 'Streaming', 'Business', 'Email'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: activeTab === tab ? '#4f46e5' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === tab ? 'white' : 'var(--text-muted)',
                  border: activeTab === tab ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}
              >
                {tab === 'All' ? t('allTab') : tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading premium accounts...
          </div>
        ) : (
          <div className="account-grid">
            {filteredListings.slice(0, 8).map(listing => (
              <AccountCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link to="/marketplace" className="btn btn-outline btn-lg">
            {t('browseAllAccounts')} ({featuredListings.length}+) <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Escrow Process Banner */}
      <div className="container">
        <TrustBanner />
      </div>

    </div>
  );
}
