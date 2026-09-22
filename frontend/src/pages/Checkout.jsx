import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Lock, 
  Wallet, 
  CreditCard, 
  QrCode, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('id');
  const navigate = useNavigate();

  const { user, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { t, isKhmer } = useLanguage();

  const [listing, setListing] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Card mock state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  useEffect(() => {
    async function loadListing() {
      if (!listingId) {
        navigate('/marketplace');
        return;
      }
      try {
        const data = await api.getListingById(listingId);
        if (data.success) {
          setListing(data.listing);
        } else {
          setError('Failed to fetch listing');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [listingId]);

  const handleCheckoutSubmit = async () => {
    setError('');
    setProcessing(true);

    try {
      const res = await api.createOrder(listing._id, paymentMethod);
      if (res.success) {
        await refreshUser();
        // Redirect to buyer orders where credentials are auto-delivered
        navigate('/my-orders', { state: { newOrder: res.order, justPurchased: true } });
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {isKhmer ? 'កំពុងរៀបចំការទូទាត់ប្រាក់...' : 'Preparing secure checkout session...'}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '16px' }}>{isKhmer ? 'រកមិនឃើញ Account' : 'Listing Not Found'}</h2>
        <button onClick={() => navigate('/marketplace')} className="btn btn-primary">{t('backToListings')}</button>
      </div>
    );
  }

  const price = listing.price;
  const platformFee = Number(((price * 0.05)).toFixed(2));
  const total = price;

  const hasEnoughWalletBalance = (user?.walletBalance || 0) >= total;

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px', maxWidth: '1080px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
          <ShieldCheck size={16} /> {t('checkoutBadge')}
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc' }}>
          {t('checkoutTitle')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {t('checkoutSub')}
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '30px' }}>
        
        {/* Left Col: Payment Method Selection */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '20px' }}>
            {t('selectPaymentMethod')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            
            {/* Option 1: Wallet Balance */}
            <div 
              onClick={() => setPaymentMethod('wallet')}
              style={{
                border: paymentMethod === 'wallet' ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                background: paymentMethod === 'wallet' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '14px',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={20} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'white' }}>{t('walletBalanceOpt')}</div>
                  <div style={{ fontSize: '0.82rem', color: hasEnoughWalletBalance ? '#34d399' : '#f87171' }}>
                    {isKhmer ? 'សមតុល្យ៖ ' : 'Available: '} {formatPrice(user?.walletBalance || 0)} {hasEnoughWalletBalance ? (isKhmer ? '(គ្រប់គ្រាន់)' : '(Sufficient)') : (isKhmer ? '(មិនគ្រប់គ្រាន់)' : '(Insufficient Funds)')}
                  </div>
                </div>
              </div>
              <input type="radio" checked={paymentMethod === 'wallet'} onChange={() => {}} />
            </div>

            {/* Option 2: Crypto USDT */}
            <div 
              onClick={() => setPaymentMethod('crypto_usdt')}
              style={{
                border: paymentMethod === 'crypto_usdt' ? '2px solid #06b6d4' : '1px solid var(--border-subtle)',
                background: paymentMethod === 'crypto_usdt' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '14px',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={20} color="#22d3ee" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'white' }}>{t('cryptoOpt')}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    {isKhmer ? 'ផ្ទេររូបិយប័ណ្ណឌីជីថលភ្លាមៗ & ចាក់សោរក្នុង Escrow' : 'Instant decentralized deposit & escrow hold'}
                  </div>
                </div>
              </div>
              <input type="radio" checked={paymentMethod === 'crypto_usdt'} onChange={() => {}} />
            </div>

            {/* Option 3: Credit Card */}
            <div 
              onClick={() => setPaymentMethod('stripe_card')}
              style={{
                border: paymentMethod === 'stripe_card' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                background: paymentMethod === 'stripe_card' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '14px',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#34d399" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'white' }}>{t('cardOpt')}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    Visa, MasterCard, American Express
                  </div>
                </div>
              </div>
              <input type="radio" checked={paymentMethod === 'stripe_card'} onChange={() => {}} />
            </div>

            {/* Option 4: ABA KHQR */}
            <div 
              onClick={() => setPaymentMethod('aba_khqr')}
              style={{
                border: paymentMethod === 'aba_khqr' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                background: paymentMethod === 'aba_khqr' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '14px',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem' }}>🇰🇭</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'white' }}>{t('abaOpt')}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    {isKhmer ? 'ស្កេន QR កូដតាមរយៈ ABA Mobile ឬគ្រប់ធនាគារក្នុងបាគង' : 'Scan QR code via ABA Mobile or any Bakong bank'}
                  </div>
                </div>
              </div>
              <input type="radio" checked={paymentMethod === 'aba_khqr'} onChange={() => {}} />
            </div>

          </div>

          {/* Payment Details Drawer according to chosen method */}
          {paymentMethod === 'crypto_usdt' && (
            <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px dashed rgba(6, 182, 212, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#38bdf8', marginBottom: '8px' }}>
                🪙 {isKhmer ? 'ប្រព័ន្ធទទួលលុយ USDT TRC-20 Escrow' : 'Simulated USDT TRC-20 Escrow Gateway'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Deposit Address: TXq9M48A7vK12ZpeLNx789RtX
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px' }}>
                ✓ {isKhmer ? 'ប្រព័ន្ធផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិដំណើរការ' : 'Instant blockchain verification simulator active'}
              </div>
            </div>
          )}

          {paymentMethod === 'stripe_card' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
              <div className="form-group">
                <label className="form-label">{isKhmer ? 'លេខកាតធនាគារ' : 'Card Number'}</label>
                <input type="text" className="form-input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">{isKhmer ? 'កាលបរិច្ឆេទផុតកំណត់' : 'Expires'}</label>
                  <input type="text" className="form-input" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">CVC / CVV</label>
                  <input type="text" className="form-input" value={cardCvc} onChange={e => setCardCvc(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'aba_khqr' && (
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginBottom: '6px' }}>
                🇰🇭 ABA KHQR Instant Pay (USD / KHR)
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {isKhmer ? 'ចុចទូទាត់ប្រាក់ដើម្បីចាក់សោរលុយចូល Escrow និងដោះសោរ Account ភ្លាមៗ។' : 'Clicking checkout will instantly authorize and hold funds in escrow.'}
              </p>
            </div>
          )}

        </div>

        {/* Right Col: Order Summary & Escrow Guarantee */}
        <div>
          <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '20px' }}>
              {t('orderSummaryTitle')}
            </h2>

            {/* Listing item snippet */}
            <div style={{ display: 'flex', gap: '14px', paddingBottom: '18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              <img 
                src={listing.images && listing.images[0] ? listing.images[0] : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80'} 
                alt="thumb" 
                style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: '4px' }}>
                  {listing.title}
                </h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="badge badge-primary">{listing.category}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>{listing.region}</span>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>{t('accountPrice')}</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{formatPrice(price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>{t('platformFeeLabel')}</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{isKhmer ? 'រួមបញ្ចូលរួច (អ្នកលក់ទទួលខុសត្រូវ)' : 'Included (Seller paid)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>{t('warrantyProtectionLabel')}</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{listing.warrantyHours} {isKhmer ? 'ម៉ោង រួមបញ្ចូលរួច' : 'Hours Included'}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
                <span style={{ color: 'white' }}>{t('totalPaymentLabel')}</span>
                <span style={{ color: '#38bdf8' }}>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckoutSubmit}
              disabled={processing || (paymentMethod === 'wallet' && !hasEnoughWalletBalance)}
              className="btn btn-primary btn-lg"
              style={{ 
                width: '100%', 
                marginBottom: '16px',
                opacity: (paymentMethod === 'wallet' && !hasEnoughWalletBalance) ? 0.6 : 1
              }}
            >
              {processing ? (isKhmer ? 'កំពុងចាក់សោរក្នុង Escrow...' : 'Locking in Escrow...') : t('lockEscrowBtn')}
            </button>

            {paymentMethod === 'wallet' && !hasEnoughWalletBalance && (
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <button 
                  onClick={() => navigate('/wallet')} 
                  className="btn btn-outline btn-sm" 
                  style={{ width: '100%', color: '#fbbf24' }}
                >
                  {t('depositToContinue')}
                </button>
              </div>
            )}

            {/* Guarantee footnote */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} />
              {t('escrowRuleNote')}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
