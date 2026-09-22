import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  PlusCircle, 
  DollarSign, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Key, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SellerStudio() {
  const { user, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { t, isKhmer } = useLanguage();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gaming');
  const [subcategory, setSubcategory] = useState('Steam');
  const [price, setPrice] = useState('');
  const [region, setRegion] = useState('Global');
  const [warrantyHours, setWarrantyHours] = useState('48');
  
  // Credentials Vault
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState('');
  const [secretInstructions, setSecretInstructions] = useState('');

  // Specs
  const [specs, setSpecs] = useState([
    { key: 'Status / Rank', value: '' },
    { key: 'Full Access Email', value: 'Yes (Included)' }
  ]);

  const fetchSellerData = async () => {
    try {
      const salesRes = await api.getSellerSales();
      if (salesRes.success) setSales(salesRes.orders);
    } catch (err) {
      console.error('Error loading seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleCreateListingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        title,
        description,
        category,
        subcategory,
        price: parseFloat(price),
        region,
        warrantyHours: parseInt(warrantyHours),
        specs: specs.filter(s => s.key.trim() && s.value.trim()),
        loginIdentifier,
        password,
        backupCodes,
        secretInstructions
      };

      const res = await api.createListing(payload);
      if (res.success) {
        setSuccessMsg(isKhmer ? 'បានបង្ហោះ Account ជោគជ័យ! គណនីរបស់អ្នកមានវត្តមានលើផ្សាររួចរាល់។' : 'Account listed successfully! Verified and added to public marketplace.');
        setModalOpen(false);
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setLoginIdentifier('');
        setPassword('');
        setBackupCodes('');
        setSecretInstructions('');
        await refreshUser();
        fetchSellerData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <ShieldCheck size={16} /> {t('sellerPortalBadge')}
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc' }}>
            {t('sellerStudioTitle')}
          </h1>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-emerald btn-lg">
          <PlusCircle size={18} /> {t('uploadAccountBtn')}
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('availableWalletBal')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399', margin: '4px 0' }}>
            {formatPrice(user?.walletBalance || 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isKhmer ? 'រួចរាល់សម្រាប់ការដកប្រាក់' : 'Ready for instant withdrawal'}</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('inEscrowPending')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24', margin: '4px 0' }}>
            {formatPrice(user?.escrowHoldingBalance || 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isKhmer ? 'នឹងត្រូវផ្ទេរពេលអ្នកទិញបញ្ជាក់' : 'Releases upon buyer confirmation'}</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('sellerTrustScore')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>
            ★ {user?.rating || '5.0'} / 5.0
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.reviewCount || 100}+ {isKhmer ? 'មតិវិជ្ជមាន' : 'positive reviews'}</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t('kycStatusLabel')}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', margin: '8px 0' }}>
            ✓ {isKhmer ? 'បានផ្ទៀងផ្ទាត់រួច (Verified)' : 'Verified Merchant'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isKhmer ? 'គ្មានដែនកំណត់នៃការដកប្រាក់' : 'Zero withdrawal limits'}</div>
        </div>

      </div>

      {/* Seller Sales Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: '20px' }}>
          {t('recentSoldAccounts')}
        </h2>

        {sales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No sales yet. Click "+ Upload Account for Sale" above to list your digital accounts!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px 16px' }}>Order #</th>
                  <th style={{ padding: '12px 16px' }}>Account Title</th>
                  <th style={{ padding: '12px 16px' }}>Gross Sale</th>
                  <th style={{ padding: '12px 16px' }}>Net Payout (95%)</th>
                  <th style={{ padding: '12px 16px' }}>Escrow Status</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {sale.orderNumber}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'white' }}>
                      {sale.listingTitle}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {formatPrice(sale.amount)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#34d399' }}>
                      {formatPrice(sale.sellerPayoutAmount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {sale.escrowStatus === 'holding' && <span className="badge badge-amber">Holding in Escrow</span>}
                      {sale.escrowStatus === 'released' && <span className="badge badge-emerald">Released to Wallet</span>}
                      {sale.escrowStatus === 'disputed' && <span className="badge badge-rose">Disputed</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Account Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={22} color="#10b981" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                  Upload Account to Marketplace
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateListingSubmit}>
              
              <div className="form-group">
                <label className="form-label">Account Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Steam CS2 Prime + 10-Yr Coin | 4,200h | Butterfly Knife"
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Streaming">Streaming</option>
                    <option value="Business">Business</option>
                    <option value="Email">Email</option>
                    <option value="Ecommerce">Ecommerce</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subcategory / Game / Brand</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Steam, Netflix, Instagram"
                    className="form-input"
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Price (USD $)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="e.g. 45"
                    className="form-input"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <select value={region} onChange={e => setRegion(e.target.value)} className="form-select">
                    <option value="Global">Global</option>
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty (Hours)</label>
                  <select value={warrantyHours} onChange={e => setWarrantyHours(e.target.value)} className="form-select">
                    <option value="24">24 Hours</option>
                    <option value="48">48 Hours</option>
                    <option value="72">72 Hours</option>
                    <option value="168">7 Days</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Public Description</label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="Describe original email status, skins, playtime, rank, or subscription perks..."
                  className="form-textarea"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Secret Credentials Vault Section */}
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
                  <Key size={16} /> Secret Auto-Delivery Vault (រក្សាទុកសម្ងាត់)
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  These credentials remain strictly encrypted and are ONLY automatically revealed to the buyer after escrow payment is confirmed.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Login Identifier / Email</label>
                    <input 
                      type="text" 
                      required
                      placeholder="account_user or email"
                      className="form-input"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <input 
                      type="text" 
                      required
                      placeholder="SecretPassword!123"
                      className="form-input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">2FA Backup Codes / Recovery Instructions (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="Enter backup recovery codes or OG email password..."
                    className="form-textarea"
                    value={backupCodes}
                    onChange={e => setBackupCodes(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-emerald btn-lg">
                  {submitting ? 'Encrypting & Listing...' : 'Publish to Marketplace 🚀'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
