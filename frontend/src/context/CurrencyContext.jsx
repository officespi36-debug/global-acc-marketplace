import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

const RATES = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro', flag: '🇪🇺' },
  THB: { symbol: '฿', rate: 36.5, name: 'Thai Baht', flag: '🇹🇭' },
  KHR: { symbol: '៛', rate: 4100, name: 'Khmer Riel', flag: '🇰🇭' }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  const formatPrice = (usdAmount) => {
    if (usdAmount === undefined || usdAmount === null) return '$0.00';
    const num = Number(usdAmount);
    const curr = RATES[currency] || RATES.USD;
    const converted = num * curr.rate;

    if (currency === 'KHR') {
      return `${Math.round(converted).toLocaleString()} ${curr.symbol}`;
    }
    if (currency === 'THB') {
      return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    }
    if (currency === 'EUR') {
      return `${curr.symbol}${converted.toFixed(2)}`;
    }
    return `${curr.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      currencies: RATES,
      formatPrice,
      currentCurrencyMeta: RATES[currency] || RATES.USD
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
