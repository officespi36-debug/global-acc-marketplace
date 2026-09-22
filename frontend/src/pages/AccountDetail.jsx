import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Zap, 
  Clock, 
  Star, 
  CheckCircle, 
  Lock, 
  Share2, 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { t, isKhmer } = useLanguage();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    async function loadAccount() {
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          api.getListingById(id),
          api.getReviews({ listingId: id })
        ]);
        if (listingRes.success) setListing(listingRes.listing);
        if (reviewsRes.success) setReviews(reviewsRes.reviews);
      } catch (err) {
        console.error('Failed to load account details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {isKhmer ? 'កំពុងទាញយកព័ត៌មាន Account...' : 'Loading account details...'}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '16px' }}>{isKhmer ? 'រកមិនឃើញ Account នេះទេ' : 'Account Not Found'}</h2>
        <Link to="/marketplace" className="btn btn-primary">{t('backToListings')}</Link>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="container" style={{ padding: '30px 20px 80px 20px' }}>
      
      {/* Back button */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          <ArrowLeft size={16} /> {t('backToListings')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '36px' }}>
        
        {/* Left Col: Media & Specifications */}
        <div>
          {/* Main Showcase Image */}
          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden', height: '380px', marginBottom: '16px', position: 'relative' }}>
            <img 
              src={images[selectedImg] || images[0]} 
              alt={listing.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
              <span className="badge badge-primary">{listing.category}</span>
              <span className="badge badge-cyan">{listing.subcategory}</span>
            </div>
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px' }}>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={13} /> {t('autoDelivery')}
              </span>
              <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white' }}>
                <Clock size={13} /> {listing.warrantyHours}{t('warrantyHoursSuffix')}
              </span>
            </div>
          </div>

          {/* Thumbnails if multiple */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedImg === idx ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
              {t('accountDescription')}
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.96rem', whiteSpace: 'pre-line' }}>
              {listing.description}
            </p>
          </div>

          {/* Specifications Table */}
          {listing.specs && listing.specs.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                {t('techSpecsTitle')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {listing.specs.map((sp, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      padding: '12px 16px', 
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{sp.key}</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }}>{sp.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{t('buyerReviewsTitle')}</span>
              <span className="badge badge-amber">{reviews.length}</span>
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                {isKhmer ? 'មិនទាន់មានការវាយតម្លៃនៅឡើយទេសម្រាប់គណនីនេះ។' : 'No reviews yet for this listing. Complete an order to be the first to leave feedback!'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviews.map((rev) => (
                  <div key={rev._id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                        {rev.buyerName || (isKhmer ? 'អ្នកទិញពិតប្រាកដ' : 'Verified Buyer')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="#fbbf24" />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Price & Escrow Checkout Card */}
        <div>
          <div className="glass-panel" style={{ padding: '30px', position: 'sticky', top: '110px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-emerald">{t('inStock')}</span>
              <span className="badge badge-cyan">{listing.region} Region</span>
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.3, color: '#f8fafc', marginBottom: '16px' }}>
              {listing.title}
            </h1>

            {/* Price Box */}
            <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('instantPurchasePrice')}</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#38bdf8' }}>
                {formatPrice(listing.price)}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {isKhmer ? 'រួមបញ្ចូលការធានា Escrow 100% & រយៈពេលធានា' : 'Includes 100% Escrow Protection & Warranty'}
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => navigate(`/checkout?id=${listing._id}`)}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: '18px', fontSize: '1.1rem', fontWeight: 800 }}
            >
              {t('buyNowEscrowBtn')}
            </button>

            {/* Trust List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <CheckCircle size={18} color="#10b981" />
                <span>{isKhmer ? 'ព័ត៌មានសម្ងាត់ដោះសោរស្វ័យប្រវត្តិក្នងទូ Credential Vault ភ្លាមៗ' : 'Instant Auto-Delivery of credentials into your order vault'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <CheckCircle size={18} color="#10b981" />
                <span><strong>{listing.warrantyHours} {isKhmer ? 'ម៉ោងធានា៖' : 'Hours Warranty:'}</strong> {isKhmer ? 'សងប្រាក់វិញ 100% ប្រសិនបើ Login មិនកើត' : 'Full refund if credentials fail'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <Lock size={18} color="#6366f1" />
                <span>{isKhmer ? 'លុយត្រូវបានរក្សាទុកក្នុង Escrow រហូតដល់អ្នកពេញចិត្ត' : 'Funds held in platform escrow until you confirm satisfaction'}</span>
              </div>
            </div>

            {/* Seller Reputation Card */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                {t('verifiedVendorInfo')}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e293b', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>
                  {listing.sellerSnapshot?.name?.charAt(0) || 'V'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{listing.sellerSnapshot?.name || 'Pro Seller'}</span>
                    <ShieldCheck size={16} color="#10b981" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#fbbf24', marginTop: '2px' }}>
                    <Star size={14} fill="#fbbf24" />
                    <span style={{ fontWeight: 700 }}>{listing.sellerSnapshot?.rating || '5.0'}</span>
                    <span style={{ color: 'var(--text-dim)' }}>({listing.sellerSnapshot?.reviewCount || 100} {isKhmer ? 'ការបញ្ជាទិញ' : 'completed orders'})</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
