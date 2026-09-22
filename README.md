# AccGlobal / AccountHub — Global Account Marketplace 🌐🛡️
> **វេបសាយលក់ Account អន្តរជាតិ (Global Digital Account Marketplace)**  
> Built with 100% Escrow Protection, Instant Auto-Delivery Credential Vault, Multi-Language (i18next: Khmer & English), and Multi-Currency Support (USD, EUR, THB, KHR).

---

## 🌟 Key Features

1. **🔐 100% Escrow Protection System**
   - Buyer payment is locked securely in neutral escrow vault upon order placement.
   - Funds are only released to the seller wallet once the buyer confirms receipt and satisfaction, or after the warranty expires without dispute.
   
2. **⚡ Instant Auto-Delivery Credential Vault**
   - Encrypted login credentials (email, username, password, 2FA backup codes, recovery keys, vendor notes) unlock automatically inside the buyer's order vault immediately upon checkout.
   
3. **🌍 Multi-Language Support (i18next & react-i18next)**
   - Industry-standard internationalization supporting **🇰🇭 ភាសាខ្មែរ (Khmer)** and **🇬🇧 English**.
   - 1-click instant language toggle on the navbar.
   - Automatically detects and persists user preference using `i18next-browser-languagedetector` in `localStorage`.

4. **💵 Multi-Currency Support**
   - Live price conversion across **USD ($)**, **EUR (€)**, **THB (฿)**, and **KHR (៛)**.

5. **🎮 Diverse Digital Categories**
   - Gaming (Steam CS2, Valorant, Epic Games, Genshin Impact, Roblox)
   - Social Media (TikTok, Instagram, Facebook Aged, Twitter/X)
   - Streaming (Netflix 4K UHD, Spotify Premium, Disney+, YouTube Premium)
   - Business & Productivity (Canva Pro, Adobe Creative Cloud, AWS)
   - Aged Email (Aged Gmail, Outlook PVA)
   - E-Commerce (Amazon Seller, eBay Stores)

6. **👑 1-Click Role Switcher & Admin Tribunal**
   - Seamless demo switcher in top bar:
     - 🛒 **Buyer** (Alex - Pre-funded $500 balance)
     - 💼 **Seller Studio** (Vortex - Pro Verified Vendor)
     - 👑 **Admin Command Center** (Arbitration Tribunal, Listing Moderation, KYC approval)

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Vanilla CSS Design System (Cyberpunk/Fintech dark aesthetic, Glassmorphism, Micro-animations)
- **i18n**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- **Icons**: Lucide React
- **Routing**: React Router v7

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt password hashing
- **Data Integrity**: Optimized compound and text search indexes on MongoDB collections (`users`, `accountlistings`, `orders`, `transactions`, `reviews`, `disputes`)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or v20+)
- MongoDB (running locally on port 27017 or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/officespi36-debug/global-acc-marketplace.git
cd global-acc-marketplace
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy example environment file
cp .env.example .env

# Seed sample data (10 verified listings, 4 roles, test orders & transactions)
npm run seed

# Start development server
npm run dev
# -> Server running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite development server
npm run dev
# -> Frontend running on http://localhost:5173
```

---

## 📦 Deployment

### Backend (Render, Railway, VPS, or DigitalOcean)
1. Provide environment variables:
   - `PORT=5000`
   - `MONGO_URI=<your_mongodb_connection_string>`
   - `JWT_SECRET=<secure_random_string>`
   - `NODE_ENV=production`
2. Start command:
   ```bash
   node src/server.js
   ```

### Frontend (Vercel, Netlify, Cloudflare Pages)
1. Build command:
   ```bash
   npm run build
   ```
2. Output directory:
   ```bash
   dist
   ```

---

## 📄 License
MIT License © 2026 AccGlobal / AccountHub
