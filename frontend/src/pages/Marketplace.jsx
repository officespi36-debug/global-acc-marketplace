import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import AccountCard from '../components/AccountCard';
import { Filter, Search, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [region, setRegion] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  const categories = ['All', 'Gaming', 'Social Media', 'Streaming', 'Business', 'Email', 'Ecommerce'];
  const regions = ['All', 'Global', 'North America', 'Europe', 'Asia', 'United States'];

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings({
        category,
        search,
        region,
        minPrice,
        maxPrice,
        sort
      });
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, region, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleResetFilters = () => {
    setCategory('All');
    setSearch('');
    setRegion('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
    setTimeout(fetchListings, 50);
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
          {t('marketplaceTitle')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          {t('marketplaceSub')}
        </p>
      </div>

      {/* Category Horizontal Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: category === cat ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
              color: category === cat ? 'white' : 'var(--text-muted)',
              border: category === cat ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: category === cat ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            {cat === 'All' ? t('allTab') : cat}
          </button>
        ))}
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Keyword Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder={t('searchKeyword')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', borderRadius: '8px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            {t('exploreBtn')}
          </button>
        </form>

        {/* Region Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>{t('regionLabel')}</span>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
          >
            {regions.map((r) => (
              <option key={r} value={r} style={{ background: '#111827', color: 'white' }}>{r === 'All' ? t('allTab') : r}</option>
            ))}
          </select>
        </div>

        {/* Price Min/Max */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>{t('priceLabel')}</span>
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice} 
            onChange={(e) => setMinPrice(e.target.value)}
            className="form-input"
            style={{ width: '80px', padding: '8px', fontSize: '0.85rem' }}
          />
          <span style={{ color: 'var(--text-dim)' }}>-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)}
            className="form-input"
            style={{ width: '80px', padding: '8px', fontSize: '0.85rem' }}
          />
          <button onClick={fetchListings} className="btn btn-outline btn-sm">
            {t('applyBtn')}
          </button>
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={16} color="var(--text-dim)" />
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
          >
            <option value="newest" style={{ background: '#111827' }}>{t('sortNewest')}</option>
            <option value="popular" style={{ background: '#111827' }}>{t('sortPopular')}</option>
            <option value="price_asc" style={{ background: '#111827' }}>{t('sortPriceAsc')}</option>
            <option value="price_desc" style={{ background: '#111827' }}>{t('sortPriceDesc')}</option>
          </select>
        </div>

        {/* Reset */}
        <button onClick={handleResetFilters} className="btn btn-outline btn-sm" style={{ color: '#94a3b8' }}>
          <RotateCcw size={14} /> {t('resetBtn')}
        </button>

      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div>{t('showingAccounts')}: <strong style={{ color: 'white' }}>{listings.length}</strong></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem' }}>
          <span>{t('escrowWarrantyAll')}</span>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Loading marketplace listings...</div>
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            {t('noAccountsFound')}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            {t('noAccountsFoundSub')}
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
            {t('clearFiltersBtn')}
          </button>
        </div>
      ) : (
        <div className="account-grid">
          {listings.map((listing) => (
            <AccountCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}

    </div>
  );
}
