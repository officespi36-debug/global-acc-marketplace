import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Star, 
  ExternalLink,
  Lock,
  Clock
} from 'lucide-react';

export default function BuyerOrders() {
  const location = useLocation();
  const { formatPrice } = useCurrency();
  const { t, isKhmer } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // Action modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');

  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  const fetchOrders = async () => {
    try {
      const data = await api.getMyOrders();
      if (data.success) {
        setOrders(data.orders);
        // If coming right from checkout, open credentials vault for that new order
        if (location.state?.justPurchased && location.state?.newOrder) {
          const matching = data.orders.find(o => o._id === location.state.newOrder._id) || location.state.newOrder;
          setSelectedOrder(matching);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Buyer releases escrow
  const handleReleaseEscrow = async (orderId) => {
    const confirmPrompt = isKhmer 
      ? 'តើអ្នកប្រាកដថាចង់ដោះលែងលុយ Escrow ជូនអ្នកលក់មែនទេ? លុយនឹងត្រូវផ្ទេរភ្លាមៗ។'
      : 'Are you sure you want to release the escrow funds? The seller will be paid immediately.';
    if (!window.confirm(confirmPrompt)) return;
    setActionSuccessMsg('');
    setActionErrorMsg('');

    try {
      const res = await api.confirmAndReleaseEscrow(orderId);
      if (res.success) {
        setActionSuccessMsg(isKhmer ? 'បានដោះលែងលុយ Escrow ជោគជ័យ! លុយត្រូវបានផ្ទេរទៅអ្នកលក់។' : 'Escrow released successfully! Funds transferred to seller.');
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, escrowStatus: 'released' }));
        }
      }
    } catch (err) {
      setActionErrorMsg(err.message);
    }
  };

  // Submit dispute
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await api.reportDispute(selectedOrder._id, disputeReason, disputeEvidence);
      if (res.success) {
        setActionSuccessMsg(isKhmer ? 'ពាក្យបណ្តឹងវិវាទត្រូវបានបញ្ជូន។ លុយ Escrow ត្រូវបានបង្កកដើម្បីឱ្យ Admin ដោះស្រាយ។' : 'Dispute ticket opened. Escrow is locked for admin arbitration.');
        setDisputeModalOpen(false);
        setDisputeReason('');
        setDisputeEvidence('');
        fetchOrders();
      }
    } catch (err) {
      setActionErrorMsg(err.message);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await api.addReview(selectedOrder._id, reviewRating, reviewComment);
      if (res.success) {
        setActionSuccessMsg(isKhmer ? 'សូមអរគុណ! ការវាយតម្លៃរបស់អ្នកត្រូវបានផ្សព្វផ្សាយ។' : 'Thank you! Your review has been published.');
        setReviewModalOpen(false);
        setReviewComment('');
      }
    } catch (err) {
      setActionErrorMsg(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
          {t('myOrdersTitle')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {t('myOrdersSub')}
        </p>
      </div>

      {actionSuccessMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          ✓ {actionSuccessMsg}
        </div>
      )}

      {actionErrorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          ✕ {actionErrorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
          {isKhmer ? 'កំពុងទាញយកទិន្នន័យការបញ្ជាទិញ...' : 'Loading your purchased orders...'}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            {t('noOrdersYet')}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            {isKhmer ? 'ស្វែងរក និងទិញ Account Gaming, Streaming និង Business លើផ្សាររបស់យើង។' : 'Explore verified gaming, streaming, and business accounts on our marketplace.'}
          </p>
          <Link to="/marketplace" className="btn btn-primary">
            {t('navMarketplace')}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 1fr' : '1fr', gap: '28px' }}>
          
          {/* Orders Table / Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => {
              const isSelected = selectedOrder?._id === order._id;
              const isHolding = order.escrowStatus === 'holding';
              const isReleased = order.escrowStatus === 'released';
              const isDisputed = order.escrowStatus === 'disputed';

              return (
                <div 
                  key={order._id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    border: isSelected ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowPassword(false);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {isKhmer ? 'កូដបញ្ជាទិញ' : 'Order'} #{order.orderNumber}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                        {order.listingTitle}
                      </h4>
                    </div>
                    
                    {/* Status Badge */}
                    <div>
                      {isHolding && (
                        <span className="badge badge-amber" style={{ animation: 'pulseGlow 2s infinite' }}>
                          {t('inEscrowHoldBadge')}
                        </span>
                      )}
                      {isReleased && (
                        <span className="badge badge-emerald">
                          {t('completedReleasedBadge')}
                        </span>
                      )}
                      {isDisputed && (
                        <span className="badge badge-rose">
                          {t('disputedBadge')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div>{isKhmer ? 'បានបង់៖ ' : 'Paid: '}<strong style={{ color: '#38bdf8' }}>{formatPrice(order.amount)}</strong> via {order.paymentMethod?.toUpperCase()}</div>
                    <button className="btn btn-primary btn-sm" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                      <Key size={13} /> {t('openCredentialVault')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Col: Credential Vault & Escrow Resolution Panel */}
          {selectedOrder && (
            <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(99, 102, 241, 0.4)', position: 'sticky', top: '100px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={20} color="#818cf8" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
                    {isKhmer ? 'ទូផ្ទុកព័ត៌មានសម្ងាត់ (Credential Vault)' : 'Credential Vault'}
                  </h3>
                </div>
                <span className="badge badge-emerald">{t('autoDelivery')}</span>
              </div>

              {/* Login Identifier */}
              <div className="form-group">
                <label className="form-label">{t('usernameLoginLabel')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedOrder.deliveredCredentials?.loginIdentifier || 'N/A'}
                    className="form-input"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  />
                  <button 
                    onClick={() => handleCopy(selectedOrder.deliveredCredentials?.loginIdentifier, 'login')}
                    className="btn btn-outline"
                    title="Copy"
                  >
                    {copiedKey === 'login' ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">{t('passwordLabel')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    readOnly 
                    value={selectedOrder.deliveredCredentials?.password || 'N/A'}
                    className="form-input"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-outline"
                    title="Toggle Visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button 
                    onClick={() => handleCopy(selectedOrder.deliveredCredentials?.password, 'pass')}
                    className="btn btn-outline"
                    title="Copy"
                  >
                    {copiedKey === 'pass' ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Backup codes or Email access */}
              {selectedOrder.deliveredCredentials?.backupCodes && (
                <div className="form-group">
                  <label className="form-label">{t('backupCodesLabel')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea 
                      readOnly 
                      rows={2}
                      value={selectedOrder.deliveredCredentials.backupCodes}
                      className="form-textarea"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                    />
                    <button 
                      onClick={() => handleCopy(selectedOrder.deliveredCredentials.backupCodes, 'backup')}
                      className="btn btn-outline"
                      title="Copy"
                    >
                      {copiedKey === 'backup' ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Secret seller instructions */}
              {selectedOrder.deliveredCredentials?.secretInstructions && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '14px', marginBottom: '22px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {t('vendorNotesLabel')}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {selectedOrder.deliveredCredentials.secretInstructions}
                  </p>
                </div>
              )}

              {/* Escrow Actions */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {selectedOrder.escrowStatus === 'holding' && (
                  <>
                    <button 
                      onClick={() => handleReleaseEscrow(selectedOrder._id)}
                      className="btn btn-emerald btn-lg"
                      style={{ width: '100%', fontWeight: 800 }}
                    >
                      {t('confirmReleaseBtn')}
                    </button>
                    <button 
                      onClick={() => setDisputeModalOpen(true)}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                    >
                      <AlertTriangle size={14} /> {t('reportIssueBtn')}
                    </button>
                  </>
                )}

                {selectedOrder.escrowStatus === 'released' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '12px' }}>
                      {isKhmer ? '✓ បានដោះលែងលុយ Escrow ជូនអ្នកលក់រួចរាល់' : '✓ Escrow completed and released to seller.'}
                    </div>
                    <button 
                      onClick={() => setReviewModalOpen(true)}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#fbbf24' }}
                    >
                      <Star size={14} /> {t('leaveReviewBtn')}
                    </button>
                  </div>
                )}

                {selectedOrder.escrowStatus === 'disputed' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center' }}>
                    {isKhmer ? 'ពាក្យបណ្តឹងវិវាទកំពុងដំណើរការ។ មន្ត្រី Admin កំពុងពិនិត្យភស្តុតាង។' : 'Dispute is active. AccGlobal arbitration staff is reviewing evidence.'}
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              Rate Your Experience
            </h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Star Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setReviewRating(num)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star size={28} fill={num <= reviewRating ? '#fbbf24' : 'none'} color="#fbbf24" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Feedback / Review</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="Tell other buyers about delivery speed, account authenticity, and vendor communication..."
                  className="form-textarea"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setReviewModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="modal-overlay" onClick={() => setDisputeModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={22} /> Report Issue & Dispute Escrow
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '18px' }}>
              Submitting a dispute immediately freezes escrow funds. Our arbitration team will inspect the case within 12 hours.
            </p>
            <form onSubmit={handleDisputeSubmit}>
              <div className="form-group">
                <label className="form-label">Issue Reason</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Credentials incorrect, Account was banned, Missing skins..."
                  className="form-input"
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Evidence & Screenshot Details</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="Describe exact error code, login message, or attach image link..."
                  className="form-textarea"
                  value={disputeEvidence}
                  onChange={e => setDisputeEvidence(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setDisputeModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#dc2626' }}>Open Dispute Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
