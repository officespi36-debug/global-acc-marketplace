import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { Zap, ShieldCheck, Star, MapPin, Clock } from 'lucide-react';

export default function AccountCard({ listing }) {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Gaming': return 'badge-cyan';
      case 'Social Media': return 'badge-rose';
      case 'Streaming': return 'badge-amber';
      case 'Business': return 'badge-primary';
      case 'Email': return 'badge-emerald';
      case 'Ecommerce': return 'badge-primary';
      default: return 'badge-primary';
    }
  };

  const thumbnail = (listing.images && listing.images.length > 0)
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';

  return (
    <div 
      className="glass-panel" 
      style={{ 
        overflow: 'hidden', 
        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Thumbnail Header */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
        <img 
          src={thumbnail} 
          alt={listing.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(10,13,20,0.9) 100%)' }} />
        
        {/* Badges on image */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <span className={`badge ${getCategoryColor(listing.category)}`}>
            {listing.category}
          </span>
          <span className="badge badge-primary" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            {listing.subcategory}
          </span>
        </div>

        <div style={{ position: 'absolute', bottom: '10px', left: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
            <Zap size={12} /> {t('autoDelivery')}
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.72rem' }}>
            <Clock size={11} /> {listing.warrantyHours}{t('warrantyHoursSuffix')}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/account/${listing._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            lineHeight: 1.4, 
            color: 'var(--text-main)', 
            marginBottom: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {listing.title}
          </h3>
        </Link>

        {/* Specs highlights */}
        {listing.specs && listing.specs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {listing.specs.slice(0, 2).map((sp, idx) => (
              <span key={idx} style={{ 
                fontSize: '0.75rem', 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                padding: '3px 8px',
                color: 'var(--text-muted)'
              }}>
                <strong style={{ color: '#cbd5e1' }}>{sp.key}:</strong> {sp.value}
              </span>
            ))}
          </div>
        )}

        {/* Seller Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '14px', marginTop: 'auto', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {listing.sellerSnapshot?.name || 'Verified Seller'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
            <Star size={13} fill="#fbbf24" />
            <span style={{ fontWeight: 700 }}>{listing.sellerSnapshot?.rating || '5.0'}</span>
            <span style={{ color: 'var(--text-dim)' }}>({listing.sellerSnapshot?.reviewCount || 100})</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('priceText')}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatPrice(listing.price)}
            </div>
          </div>
          
          <Link 
            to={`/account/${listing._id}`} 
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            {t('buyNowBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
