import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import AccountDetail from './pages/AccountDetail';
import Checkout from './pages/Checkout';
import BuyerOrders from './pages/BuyerOrders';
import SellerStudio from './pages/SellerStudio';
import Wallet from './pages/Wallet';
import AdminDashboard from './pages/AdminDashboard';
import LoginRegister from './pages/LoginRegister';

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CurrencyProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/account/:id" element={<AccountDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-orders" element={<BuyerOrders />} />
                <Route path="/seller-studio" element={<SellerStudio />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/auth" element={<LoginRegister />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CurrencyProvider>
      </AuthProvider>
    </LanguageProvider>
  </Router>
);
}
