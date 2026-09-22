import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Sliders,
  Scale
} from 'lucide-react';

export default function AdminDashboard() {
  const { formatPrice } = useCurrency();
  const { t, isKhmer } = useLanguage();
  const [stats, setStats] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('disputes');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    try {
      const [statsRes, disputesRes, pendingRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getDisputes(),
        api.getPendingListings(),
        api.getUsers()
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (disputesRes.success) setDisputes(disputesRes.disputes);
      if (pendingRes.success) setPendingListings(pendingRes.listings);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveDispute = async (id, resolution) => {
    try {
      const decisionNote = prompt(
        isKhmer 
          ? `សូមបញ្ចូលមូលហេតុនៃការសម្រេចចិត្តរបស់ Admin សម្រាប់ ${resolution === 'refund_buyer' ? 'សងប្រាក់ទៅអ្នកទិញវិញ (REFUND)' : 'ផ្ទេរប្រាក់ជូនអ្នកលក់ (PAYOUT)'}៖`
          : `Please enter admin arbitration decision note for ${resolution === 'refund_buyer' ? 'BUYER REFUND' : 'SELLER PAYOUT'}:`, 
        'Reviewed evidence and executed standard platform resolution.'
      );
      if (!decisionNote) return;

      const res = await api.resolveDispute(id, resolution, decisionNote);
      if (res.success) {
        setActionMsg(`✓ Dispute resolved: ${resolution === 'refund_buyer' ? 'Refunded Buyer' : 'Paid Seller'}`);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleListingStatus = async (id, status) => {
    try {
      const res = await api.updateListingStatus(id, status);
      if (res.success) {
        setActionMsg(`✓ Listing status updated to ${status}`);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleBan = async (id) => {
    try {
      const res = await api.toggleBanUser(id);
      if (res.success) {
        setActionMsg(`✓ ${res.message}`);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleKYC = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
    try {
      const res = await api.toggleVerifyKYC(id, nextStatus);
      if (res.success) {
        setActionMsg(`✓ KYC status updated to ${nextStatus}`);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fb7185', background: 'rgba(244, 63, 94, 0.12)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
          <Sliders size={15} /> {t('adminPortalBadge')}
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc' }}>
          {t('adminCommandTitle')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {t('adminCommandSub')}
        </p>
      </div>

      {actionMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          {actionMsg}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{isKhmer ? 'ទំហំពាណិជ្ជកម្មសរុប (GMV)' : 'Gross Merchandise Volume'}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
            {formatPrice(stats?.grossVolume || 0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {stats?.totalOrders || 0} {isKhmer ? 'ការបញ្ជាទិញសរុប' : 'Total Orders'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{isKhmer ? 'ចំណូលកម្រៃជើងសារ (5%)' : 'Platform Revenue (5%)'}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
            {formatPrice(stats?.platformFees || 0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isKhmer ? 'កម្រៃពីប្រព័ន្ធ Escrow' : 'Net Escrow Commissions'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{isKhmer ? 'វិវាទកំពុងដោះស្រាយ' : 'Active Dispute Cases'}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fb7185', marginTop: '4px' }}>
            {stats?.openDisputes || 0} {isKhmer ? 'ករណី' : 'Open'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isKhmer ? 'ត្រូវការការកាត់សេចក្តី' : 'Requires arbitration'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{isKhmer ? 'អ្នកប្រើប្រាស់សរុប' : 'Total Registered Users'}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#cbd5e1', marginTop: '4px' }}>
            {stats?.totalUsers || 0} {isKhmer ? 'នាក់' : 'Users'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isKhmer ? 'អ្នកទិញ & អ្នកលក់' : 'Buyers & Sellers'}
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('disputes')}
          className="btn"
          style={{
            background: activeTab === 'disputes' ? '#4f46e5' : 'rgba(255,255,255,0.04)',
            color: activeTab === 'disputes' ? 'white' : 'var(--text-muted)'
          }}
        >
          <Scale size={16} /> {t('disputeTribunalTab')} ({disputes.length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className="btn"
          style={{
            background: activeTab === 'pending' ? '#4f46e5' : 'rgba(255,255,255,0.04)',
            color: activeTab === 'pending' ? 'white' : 'var(--text-muted)'
          }}
        >
          <Package size={16} /> Listing Approvals ({pendingListings.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className="btn"
          style={{
            background: activeTab === 'users' ? '#4f46e5' : 'rgba(255,255,255,0.04)',
            color: activeTab === 'users' ? 'white' : 'var(--text-muted)'
          }}
        >
          <Users size={16} /> User Management ({users.length})
        </button>
      </div>

      {/* Tab 1: Disputes */}
      {activeTab === 'disputes' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Active & Resolved Escrow Disputes
          </h3>

          {disputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              No disputes active! Platform trust factor is 100%.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {disputes.map((d) => (
                <div key={d._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Dispute ID: {d._id}</div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171', marginTop: '2px' }}>
                        Reason: {d.reason}
                      </h4>
                    </div>
                    <span className={`badge ${d.status === 'open' ? 'badge-rose' : 'badge-emerald'}`}>
                      {d.status}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <strong>Evidence provided by Buyer:</strong>
                    <p style={{ marginTop: '4px', color: '#e2e8f0' }}>{d.evidenceDescription}</p>
                  </div>

                  {d.status === 'open' ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleResolveDispute(d._id, 'refund_buyer')} className="btn btn-emerald btn-sm">
                        ✓ Rule in Favor of Buyer (Full Refund)
                      </button>
                      <button onClick={() => handleResolveDispute(d._id, 'payout_seller')} className="btn btn-outline btn-sm" style={{ color: '#38bdf8' }}>
                        ✓ Rule in Favor of Seller (Release Payout)
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: '#34d399' }}>
                      ✓ Case closed: {d.status}. Admin decision: "{d.adminDecision}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Listings */}
      {activeTab === 'pending' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Listings Awaiting Moderation
          </h3>

          {pendingListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              All submitted listings have been reviewed and approved.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingListings.map((l) => (
                <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{l.title}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      Category: {l.category} • Price: {formatPrice(l.price)} • Region: {l.region}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleListingStatus(l._id, 'approved')} className="btn btn-emerald btn-sm">
                      Approve
                    </button>
                    <button onClick={() => handleListingStatus(l._id, 'rejected')} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Registered Users & Merchants
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px' }}>Name & Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Wallet</th>
                  <th style={{ padding: '12px' }}>KYC Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'white' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-rose' : u.role === 'seller' ? 'badge-emerald' : 'badge-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#38bdf8' }}>
                      {formatPrice(u.walletBalance || 0)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleToggleKYC(u._id, u.kycStatus)}
                        className={`badge ${u.kycStatus === 'verified' ? 'badge-emerald' : 'badge-amber'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle KYC"
                      >
                        {u.kycStatus || 'unverified'}
                      </button>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleToggleBan(u._id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: u.isBanned ? '#34d399' : '#f87171' }}
                      >
                        {u.isBanned ? 'Unban User' : 'Suspend / Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
