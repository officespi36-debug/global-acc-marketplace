import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  PlusCircle, 
  History, 
  ShieldCheck,
  QrCode,
  CreditCard
} from 'lucide-react';

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { t, isKhmer } = useLanguage();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Deposit modal
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositMethod, setDepositMethod] = useState('crypto_usdt');
  const [depositProcessing, setDepositProcessing] = useState(false);

  // Withdraw modal
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchWalletData = async () => {
    try {
      const data = await api.getWallet();
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepositProcessing(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const res = await api.depositToWallet(parseFloat(depositAmount), depositMethod);
      if (res.success) {
        setFeedbackMsg(isKhmer ? `បានបញ្ចូលលុយ $${depositAmount} ជោគជ័យ!` : `Deposit of $${depositAmount} completed successfully!`);
        setDepositOpen(false);
        await refreshUser();
        await fetchWalletData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setDepositProcessing(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawProcessing(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const res = await api.requestWithdrawal(parseFloat(withdrawAmount), withdrawAddress);
      if (res.success) {
        setFeedbackMsg(isKhmer ? `សំណើដកប្រាក់ $${withdrawAmount} ត្រូវបានបញ្ជូន!` : `Withdrawal request for $${withdrawAmount} submitted!`);
        setWithdrawOpen(false);
        setWithdrawAmount('');
        setWithdrawAddress('');
        await refreshUser();
        await fetchWalletData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setWithdrawProcessing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px', maxWidth: '1080px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc', marginBottom: '6px' }}>
            {t('walletTitle')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('walletSub')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setDepositOpen(true)} className="btn btn-primary btn-lg">
            <PlusCircle size={18} /> {t('topupDepositBtn')}
          </button>
          <button onClick={() => setWithdrawOpen(true)} className="btn btn-outline btn-lg">
            <ArrowUpRight size={18} /> {t('withdrawBtn')}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          ✓ {feedbackMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          ✕ {errorMsg}
        </div>
      )}

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        
        {/* Available Balance */}
        <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>
              {isKhmer ? 'សមតុល្យដែលអាចប្រើបាន (Available)' : 'Available Balance'}
            </span>
            <WalletIcon size={22} color="#818cf8" />
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#38bdf8', marginBottom: '4px' }}>
            {formatPrice(wallet?.balance || user?.walletBalance || 0)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isKhmer ? 'ចំណាយទិញទំនិញភ្លាមៗលើ Marketplace' : 'Instant spending for 1-click checkout & marketplace purchases'}
          </div>
        </div>

        {/* Escrow In-Hold */}
        <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>
              {isKhmer ? 'លុយជាប់ក្នុង Escrow (In-Escrow)' : 'In-Escrow Custody'}
            </span>
            <Lock size={22} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#fbbf24', marginBottom: '4px' }}>
            {formatPrice(wallet?.escrowHolding || user?.escrowHoldingBalance || 0)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isKhmer ? 'រង់ចាំអ្នកទិញបញ្ជាក់ ឬផុតកំណត់ម៉ោងធានា' : 'Pending buyer confirmation or warranty expiration release'}
          </div>
        </div>

      </div>

      {/* Transactions History Ledger */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <History size={20} color="#818cf8" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            {t('txLedgerTitle')}
          </h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Loading transactions...</div>
        ) : !wallet?.transactions || wallet.transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No transactions yet. Deposit funds or purchase an account to see your financial activity.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Note / Purpose</th>
                  <th style={{ padding: '12px 16px' }}>Balance After</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <span className={`badge ${
                          tx.type === 'deposit' ? 'badge-cyan' :
                          tx.type === 'escrow_release' ? 'badge-emerald' :
                          tx.type === 'refund' ? 'badge-emerald' :
                          tx.type === 'withdrawal' ? 'badge-rose' : 'badge-amber'
                        }`}>
                          {tx.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: isPositive ? '#34d399' : '#f87171' }}>
                        {isPositive ? `+${formatPrice(tx.amount)}` : `-${formatPrice(Math.abs(tx.amount))}`}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                        {tx.note || 'Marketplace transaction'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                        {formatPrice(tx.balanceAfter)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>
                          ✓ {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {depositOpen && (
        <div className="modal-overlay" onClick={() => setDepositOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              Deposit Funds to Escrow Wallet
            </h3>

            <form onSubmit={handleDepositSubmit}>
              
              {/* Preset quick buttons */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Select Amount ($ USD)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {['50', '100', '250', '500'].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDepositAmount(amt)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: depositAmount === amt ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: depositAmount === amt ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                        fontWeight: 700
                      }}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  min="10"
                  required
                  value={depositAmount} 
                  onChange={e => setDepositAmount(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Method radio */}
              <div className="form-group">
                <label className="form-label">Payment Channel</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" checked={depositMethod === 'crypto_usdt'} onChange={() => setDepositMethod('crypto_usdt')} />
                    <span>🪙 USDT TRC-20 Crypto (Instant)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" checked={depositMethod === 'stripe_card'} onChange={() => setDepositMethod('stripe_card')} />
                    <span>💳 Credit Card / Stripe</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" checked={depositMethod === 'aba_khqr'} onChange={() => setDepositMethod('aba_khqr')} />
                    <span>🇰🇭 ABA KHQR Pay (Bakong)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setDepositOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={depositProcessing} className="btn btn-primary">
                  {depositProcessing ? 'Crediting...' : `Confirm Deposit of $${depositAmount} USD`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawOpen && (
        <div className="modal-overlay" onClick={() => setWithdrawOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              Withdraw Available Funds
            </h3>
            <form onSubmit={handleWithdrawSubmit}>
              <div className="form-group">
                <label className="form-label">Withdrawal Amount ($ USD)</label>
                <input 
                  type="number" 
                  required
                  min="5"
                  max={wallet?.balance || user?.walletBalance || 0}
                  placeholder="e.g. 150"
                  className="form-input"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Max available: {formatPrice(wallet?.balance || user?.walletBalance || 0)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">USDT (TRC-20) Payout Address / Bank Account</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. TXq9M48A7vK12ZpeLNx789RtX or Bank Account"
                  className="form-input"
                  value={withdrawAddress}
                  onChange={e => setWithdrawAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setWithdrawOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={withdrawProcessing} className="btn btn-primary">
                  {withdrawProcessing ? 'Processing Payout...' : 'Request Payout Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
