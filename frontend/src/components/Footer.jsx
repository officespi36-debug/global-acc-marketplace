import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe, Mail, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#070a10', borderTop: '1px solid var(--border-subtle)', marginTop: '80px', padding: '60px 0 30px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '36px', marginBottom: '40px' }}>
          
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} color="#fff" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>AccGlobal</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              វេបសាយលក់ Account អន្តរជាតិឈានមុខគេលើពិភពលោក។ ប្រព័ន្ធទិញ-លក់មានសុវត្ថិភាពខ្ពស់ ធានាដោយ Escrow និង Auto-Delivery ភ្លាមៗ។
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">🔐 Escrow Guarantee</span>
              <span className="badge badge-cyan">⚡ Instant Delivery</span>
            </div>
          </div>

          {/* Account Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Categories (ប្រភេទ)
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li><Link to="/marketplace?category=Gaming" style={{ color: 'inherit' }}>🎮 Gaming (Steam, Valorant, Epic)</Link></li>
              <li><Link to="/marketplace?category=Social Media" style={{ color: 'inherit' }}>📱 Social Media (IG, TikTok, FB)</Link></li>
              <li><Link to="/marketplace?category=Streaming" style={{ color: 'inherit' }}>🎬 Streaming (Netflix 4K, Spotify)</Link></li>
              <li><Link to="/marketplace?category=Business" style={{ color: 'inherit' }}>💼 Business (Canva Pro, Adobe)</Link></li>
              <li><Link to="/marketplace?category=Email" style={{ color: 'inherit' }}>📧 Aged Email (Gmail, Outlook)</Link></li>
              <li><Link to="/marketplace?category=Ecommerce" style={{ color: 'inherit' }}>🛒 E-Commerce (Amazon, eBay)</Link></li>
            </ul>
          </div>

          {/* Trust & Payments */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Accepted Payments
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
              We support fast multi-currency settlement worldwide:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <span style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>🪙 Crypto USDT (TRC20)</span>
              <span style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>💳 Stripe / Credit Card</span>
              <span style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>🅿️ PayPal</span>
              <span style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>🇰🇭 ABA KHQR Pay</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> 256-Bit SSL Encrypted Escrow
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Platform & Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li><Link to="/seller-studio" style={{ color: 'inherit' }}>Become a Verified Seller</Link></li>
              <li><Link to="/my-orders" style={{ color: 'inherit' }}>Order History & Credential Vault</Link></li>
              <li><Link to="/wallet" style={{ color: 'inherit' }}>Wallet & Top-up</Link></li>
              <li><Link to="/admin" style={{ color: 'inherit' }}>Admin Moderation Panel</Link></li>
              <li><span style={{ color: 'var(--text-dim)' }}>24/7 Dispute Arbitration</span></li>
            </ul>
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          <div>© 2026 AccGlobal / AccountHub Inc. All rights reserved. Built for high-trust global digital account trade.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Escrow Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
