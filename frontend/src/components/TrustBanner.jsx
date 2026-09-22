import React from 'react';
import { Lock, Zap, CheckCircle2, DollarSign, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TrustBanner() {
  const { t, isKhmer } = useLanguage();

  const steps = [
    {
      icon: <Lock size={22} color="#6366f1" />,
      step: '01',
      title: isKhmer ? 'អ្នកទិញបង់ប្រាក់ចូល Escrow' : 'Buyer Pays into Escrow',
      desc: isKhmer 
        ? 'លុយរបស់អ្នកទិញត្រូវបានចាក់សោរទុកក្នុង Escrow Vault ជាកណ្តាល។ អ្នកលក់មិនទាន់ទទួលបានលុយភ្លាមនោះទេ។' 
        : 'Funds are securely locked in our neutral escrow vault. Seller does not get paid yet.'
    },
    {
      icon: <Zap size={22} color="#06b6d4" />,
      step: '02',
      title: isKhmer ? 'ទទួលបាន Account ភ្លាមៗ' : 'Instant Auto-Delivery',
      desc: isKhmer
        ? 'Login, Password, និង 2FA Backup codes ត្រូវបានដោះសោរបង្ហាញជូនអ្នកទិញក្នុងទំព័រ Credential Vault ដោយស្វ័យប្រវត្តិ។'
        : 'Encrypted login credentials and 2FA recovery codes unlock immediately in your order vault.'
    },
    {
      icon: <CheckCircle2 size={22} color="#10b981" />,
      step: '03',
      title: isKhmer ? 'ត្រួតពិនិត្យ & ផ្ទៀងផ្ទាត់' : 'Buyer Inspects & Verifies',
      desc: isKhmer
        ? 'អ្នកទិញមានពេលវេលាធានាពេញលេញដើម្បីចូលតេស្ត Account, ប្តូរលេខសម្ងាត់ និងពិនិត្យមើលលក្ខណៈពិសេស។'
        : 'You have full warranty time to verify access, change passwords, and test features.'
    },
    {
      icon: <DollarSign size={22} color="#f59e0b" />,
      step: '04',
      title: isKhmer ? 'បញ្ជូនលុយទៅអ្នកលក់' : 'Funds Released to Seller',
      desc: isKhmer
        ? 'នៅពេលអ្នកទិញចុចបញ្ជាក់ថាទទួលបានត្រឹមត្រូវ លុយនឹងត្រូវផ្ទេរចូលទៅកាន់កាបូបរបស់អ្នកលក់ភ្លាមៗ។'
        : 'Buyer confirms satisfaction, and money is immediately transferred to seller wallet.'
    }
  ];

  return (
    <section className="glass-panel" style={{ padding: '36px 28px', margin: '40px 0', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px' }}>
          <ShieldAlert size={16} /> {t('escrowBadge')}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
          {t('howEscrowWorks')}
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
          {t('howEscrowWorksDesc')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {steps.map((s, idx) => (
          <div 
            key={idx} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px 20px',
              position: 'relative',
              transition: 'border-color 0.2s, transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.15)', fontFamily: 'var(--font-mono)' }}>
                {s.step}
              </span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
              {s.title}
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
