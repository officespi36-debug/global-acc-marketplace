const bcrypt = require('bcryptjs');
const { isConnected } = require('../config/db');
const User = require('../models/User');
const AccountListing = require('../models/AccountListing');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');

// In-memory runtime data cache
let users = [];
let listings = [];
let orders = [];
let transactions = [];
let reviews = [];
let disputes = [];

const initSeedData = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedSellerPass = await bcrypt.hash('seller123', 10);
  const hashedBuyerPass = await bcrypt.hash('buyer123', 10);

  const adminId = '660000000000000000000001';
  const sellerId = '660000000000000000000002';
  const buyerId = '660000000000000000000003';

  users = [
    {
      _id: adminId,
      name: 'AccGlobal Admin',
      email: 'admin@accglobal.io',
      password: hashedAdminPass,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      walletBalance: 1250.00,
      escrowHoldingBalance: 0,
      rating: 5.0,
      reviewCount: 48,
      kycStatus: 'verified',
      isBanned: false,
      createdAt: new Date('2024-01-01')
    },
    {
      _id: sellerId,
      name: 'Vortex Global Goods',
      email: 'pro_seller@accglobal.io',
      password: hashedSellerPass,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      walletBalance: 420.00,
      escrowHoldingBalance: 240.00,
      rating: 4.95,
      reviewCount: 142,
      kycStatus: 'verified',
      isBanned: false,
      createdAt: new Date('2024-02-15')
    },
    {
      _id: buyerId,
      name: 'Alex Gamer',
      email: 'buyer@accglobal.io',
      password: hashedBuyerPass,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      walletBalance: 500.00,
      escrowHoldingBalance: 0,
      rating: 5.0,
      reviewCount: 12,
      kycStatus: 'verified',
      isBanned: false,
      createdAt: new Date('2024-03-10')
    }
  ];

  listings = [
    {
      _id: '661000000000000000000001',
      title: 'Steam CS2 Prime + 10-Year Coin | 4,200 Hrs | Butterfly Knife & Gloves',
      description: 'Clean CS2 Steam Account with Original Email included. High trust factor, 4200 hours played, Faceit Level 8 ready. Includes Butterfly Knife Fade and Sport Gloves.',
      category: 'Gaming',
      subcategory: 'Steam',
      price: 185,
      currency: 'USD',
      region: 'Global',
      warrantyHours: 72,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'steam_cs2_titan99',
        password: 'Cs2Password!2026',
        backupCodes: 'STEAM-8492-XTYZ-9912\nSTEAM-2139-KLMN-4431',
        emailAccess: 'steam_backup_titan99@outlook.com:PassMail2026',
        secretInstructions: '1. Login to Steam client. 2. Verify using Outlook email provided above. 3. Immediately update phone and authenticator.'
      },
      specs: [
        { key: 'Rank / Status', value: 'CS2 Prime & Faceit Lv 8' },
        { key: 'Playtime', value: '4,200+ Hours' },
        { key: 'OG Email', value: 'Included (Full Access)' },
        { key: 'Bans / Infractions', value: 'None (Clean VAC)' }
      ],
      images: [
        'https://images.unsplash.com/photo-1612287233207-62e92c2db572?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: true,
      views: 1420,
      createdAt: new Date(Date.now() - 3600000 * 24 * 2)
    },
    {
      _id: '661000000000000000000002',
      title: 'Valorant Radiant Account | Kuronami Vandal + Champions 2023 Bundle',
      description: 'High MMR Valorant Account (North America / Global). Contains fully upgraded Kuronami Vandal, Reaver Operator, and limited Champions 2023 Knife.',
      category: 'Gaming',
      subcategory: 'Valorant',
      price: 140,
      currency: 'USD',
      region: 'North America',
      warrantyHours: 48,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'riot_val_radiant2026',
        password: 'RiotValSecret!98',
        backupCodes: 'VAL-CODE-9821-44',
        emailAccess: 'val_rad_holder@gmail.com:SecretMail#12',
        secretInstructions: 'Riot Games launcher login. First-name and DOB details are in the attached email account.'
      },
      specs: [
        { key: 'Current Rank', value: 'Immortal 3 / Radiant Peak' },
        { key: 'VP Remaining', value: '1,450 VP' },
        { key: 'Server Region', value: 'NA (Changeable)' },
        { key: 'Skins Total', value: '24 Premium Skins' }
      ],
      images: [
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: true,
      views: 980,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3)
    },
    {
      _id: '661000000000000000000003',
      title: 'Instagram 85,000 Organic Followers | Fitness & Lifestyle Niche',
      description: 'Real organic US/UK followers. Active engagement with reels averaging 40k+ views. Clean copyright record and eligible for brand sponsorships.',
      category: 'Social Media',
      subcategory: 'Instagram',
      price: 210,
      currency: 'USD',
      region: 'Global',
      warrantyHours: 72,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'fitlife.culture_official',
        password: 'InstaSecure!2026',
        backupCodes: '8910 2341 9012 4432',
        emailAccess: 'fitlife.culture.transfer@yahoo.com:Fit2026#Mail',
        secretInstructions: 'Login from mobile Instagram app. Do not change username for 24h to avoid Instagram checkpoint.'
      },
      specs: [
        { key: 'Followers', value: '85,400 Organic' },
        { key: 'Top Audience', value: 'United States (42%), UK (18%)' },
        { key: 'Creation Date', value: 'October 2019' },
        { key: 'Monetization', value: 'Brand Partnerships Active' }
      ],
      images: [
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: true,
      views: 2150,
      createdAt: new Date(Date.now() - 3600000 * 24 * 1)
    },
    {
      _id: '661000000000000000000004',
      title: 'TikTok 120,000 Followers | Creator Rewards Program Active (US Audience)',
      description: 'Aged TikTok handle with Creator Rewards Beta enabled ($0.80 - $1.40 RPM). 100% US-based traffic with viral gaming & comedy clip catalog.',
      category: 'Social Media',
      subcategory: 'TikTok',
      price: 260,
      currency: 'USD',
      region: 'United States',
      warrantyHours: 48,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'tt_viralclipshub',
        password: 'TtCreator2026$$',
        backupCodes: 'TT-7712-4412-99',
        emailAccess: 'tt_clips_host@gmail.com:TtHostPass123',
        secretInstructions: 'Login via Chrome or TikTok Mobile. Creator rewards dashboard is accessible directly in Creator Tools.'
      },
      specs: [
        { key: 'Followers', value: '120.5K' },
        { key: 'Likes Count', value: '4.8 Million' },
        { key: 'Creator Beta', value: 'Active & Verified' },
        { key: 'Phone Verified', value: 'Can be linked immediately' }
      ],
      images: [
        'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: true,
      views: 3100,
      createdAt: new Date(Date.now() - 3600000 * 12)
    },
    {
      _id: '661000000000000000000005',
      title: 'Netflix Premium 4K UHD 12-Month Private Profile (Non-Sharing PIN)',
      description: 'Official Ultra HD 4K Netflix account profile with customized 4-digit PIN lock. 365 Days warranty with instant replacement guarantee.',
      category: 'Streaming',
      subcategory: 'Netflix',
      price: 34,
      currency: 'USD',
      region: 'Global',
      warrantyHours: 168,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'premium.user.net4k@streamvault.co',
        password: 'NflxUltraPass!99',
        backupCodes: 'PIN: 4821',
        emailAccess: 'Non-applicable (Shared master managed by vendor)',
        secretInstructions: 'Use Profile 1 marked with VIP Gold crown. Enter PIN 4821. Enjoy 4K HDR streaming.'
      },
      specs: [
        { key: 'Quality', value: 'Ultra HD 4K + Dolby Atmos' },
        { key: 'Screens', value: '1 Dedicated Screen with PIN' },
        { key: 'Validity', value: '365 Days Guaranteed' },
        { key: 'Device Compatibility', value: 'Smart TV, Mobile, PC, AppleTV' }
      ],
      images: [
        'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: true,
      views: 4500,
      createdAt: new Date(Date.now() - 3600000 * 24 * 5)
    },
    {
      _id: '661000000000000000000006',
      title: 'Canva Pro Lifetime Access Invite | Enterprise Admin Seat',
      description: 'Upgrade your personal email directly to Canva Pro Lifetime or receive dedicated login with Brand Kit, 100M+ assets, and AI Magic Studio.',
      category: 'Business',
      subcategory: 'Canva Pro',
      price: 15,
      currency: 'USD',
      region: 'Global',
      warrantyHours: 720,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'canva_ent_vip@enterprise-teams.cloud',
        password: 'CanvaProUser2026',
        backupCodes: 'INVITE_CODE: CNV-PRO-98124',
        emailAccess: 'Instant direct access',
        secretInstructions: 'Login to Canva.com with the credentials provided or follow the invite link in your portal.'
      },
      specs: [
        { key: 'Duration', value: 'Lifetime Guarantee' },
        { key: 'Features', value: 'Magic Studio AI, Brand Kit, 1TB Cloud' },
        { key: 'Type', value: 'Enterprise Admin Seat' },
        { key: 'Delivery', value: 'Instant 100% Automated' }
      ],
      images: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: false,
      views: 1890,
      createdAt: new Date(Date.now() - 3600000 * 24 * 4)
    },
    {
      _id: '661000000000000000000007',
      title: 'Aged 2018 Gmail Account with YouTube History & Recovery Phone Removed',
      description: 'PVA Verified high reputation Google account created in 2018. Perfect for Google Ads, Play Console developer, or high-tier business emailing.',
      category: 'Email',
      subcategory: 'Gmail',
      price: 18,
      currency: 'USD',
      region: 'Global',
      warrantyHours: 48,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'arthur.westley.18@gmail.com',
        password: 'AgedGoogle2018!!',
        backupCodes: '849102 339102 994012 110294',
        emailAccess: 'arthur_recovery@outlook.com:PassRecov2026',
        secretInstructions: 'Login via browser incognito mode. Enter 2FA recovery backup code when prompted.'
      },
      specs: [
        { key: 'Creation Year', value: '2018 (6+ Years Aged)' },
        { key: 'Phone Status', value: 'Clean, Ready to Bind' },
        { key: 'Google Trust Score', value: 'Excellent (High Deliverability)' },
        { key: 'Google Drive', value: '15GB Free Clean' }
      ],
      images: [
        'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: false,
      views: 890,
      createdAt: new Date(Date.now() - 3600000 * 24 * 6)
    },
    {
      _id: '661000000000000000000008',
      title: 'Amazon US Aged Buyer & Reviewer Account | 45+ Verified Purchases',
      description: 'Genuine aged Amazon USA buyer account with prime history, 45+ verified customer reviews, and unlocked review privileges for product testers.',
      category: 'Ecommerce',
      subcategory: 'Amazon',
      price: 85,
      currency: 'USD',
      region: 'United States',
      warrantyHours: 72,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'amz_buyer_elite@outlook.com',
        password: 'AmzSecurePrime2026',
        backupCodes: 'OTP Seed: JBSWY3DPEHPK3PXP',
        emailAccess: 'amz_buyer_elite@outlook.com:AmzPrime2026',
        secretInstructions: 'Use US IP or residential proxy for first login. Cookies included in notes.'
      },
      specs: [
        { key: 'Account Age', value: '2019 Created' },
        { key: 'Order History', value: '45+ Delivered Orders' },
        { key: 'Review Status', value: 'Unlocked & Active' },
        { key: 'Country', value: 'Amazon.com (United States)' }
      ],
      images: [
        'https://images.unsplash.com/photo-1523474255658-406167470ea7?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: false,
      views: 740,
      createdAt: new Date(Date.now() - 3600000 * 24 * 7)
    },
    {
      _id: '661000000000000000000009',
      title: 'Genshin Impact AR 60 | C6 Furina + C6 Raiden Shogun | 42x 5-Stars',
      description: 'Endgame Genshin Impact Asia account. Whaled with all best supports at C6 and signature 5-star weapons. 100% exploration on Fontaine and Natlan.',
      category: 'Gaming',
      subcategory: 'Genshin Impact',
      price: 295,
      currency: 'USD',
      region: 'Asia',
      warrantyHours: 48,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'hoyoverse_c6_whale',
        password: 'HoyoFurinaC6!2026',
        backupCodes: 'None required',
        emailAccess: 'genshin_asia_acc@rambler.ru:Rambler2026',
        secretInstructions: 'Login to HoYooverse account portal. Change email to your preferred personal email address.'
      },
      specs: [
        { key: 'Adventure Rank', value: 'AR 60' },
        { key: '5-Star Units', value: '42 Total (C6 Furina, C6 Raiden)' },
        { key: 'Server', value: 'Asia' },
        { key: 'Primogems', value: '18,500 Saved' }
      ],
      images: [
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: true,
      views: 3800,
      createdAt: new Date(Date.now() - 3600000 * 24 * 1)
    },
    {
      _id: '661000000000000000000010',
      title: 'Spotify Premium Family Slot 1-Year Subscription (Global Activation)',
      description: 'Official Spotify Premium upgrade for your existing account or fresh profile. Enjoy ad-free music, offline listening, and high-fidelity streaming.',
      category: 'Streaming',
      subcategory: 'Spotify',
      price: 22,
      currency: 'USD',
      region: 'Global',
      warrantyHours: 168,
      deliveryType: 'instant_auto',
      credentialsVault: {
        loginIdentifier: 'family.spotify.invite.us@soundvault.net',
        password: 'SoundSpotify2026',
        backupCodes: 'Family Address: 120 E 34th St, New York, NY 10016',
        emailAccess: 'Direct link included',
        secretInstructions: 'Click the invitation link in your delivered order, enter the provided family address to join.'
      },
      specs: [
        { key: 'Duration', value: '12 Months Guaranteed' },
        { key: 'Compatibility', value: 'Your own existing account' },
        { key: 'Region', value: 'Works worldwide' },
        { key: 'Offline Mode', value: 'Unlimited Downloads' }
      ],
      images: [
        'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80'
      ],
      seller: sellerId,
      sellerSnapshot: { name: 'Vortex Global Goods', rating: 4.95, reviewCount: 142 },
      status: 'approved',
      featured: false,
      views: 1620,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3)
    }
  ];

  orders = [
    {
      _id: '662000000000000000000001',
      orderNumber: 'ACC-89210-ORD',
      listing: listings[4]._id,
      listingTitle: listings[4].title,
      listingCategory: listings[4].category,
      buyer: buyerId,
      seller: sellerId,
      amount: 34.00,
      feeAmount: 1.70,
      sellerPayoutAmount: 32.30,
      currency: 'USD',
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      escrowStatus: 'released',
      deliveredCredentials: {
        loginIdentifier: 'netflix.buyer.demo@streamvault.co',
        password: 'DemoBuyerNflx!99',
        backupCodes: 'PIN: 9912',
        emailAccess: 'Direct Profile Access',
        secretInstructions: 'Use Profile 2 (Demo VIP). Enjoy your 4K stream.'
      },
      warrantyExpiresAt: new Date(Date.now() + 3600000 * 120),
      buyerConfirmedAt: new Date(Date.now() - 3600000 * 12),
      createdAt: new Date(Date.now() - 3600000 * 24)
    }
  ];

  transactions = [
    {
      _id: '663000000000000000000001',
      user: buyerId,
      type: 'deposit',
      amount: 534.00,
      balanceAfter: 534.00,
      status: 'completed',
      note: 'Initial USDT Deposit to Wallet',
      createdAt: new Date(Date.now() - 3600000 * 48)
    },
    {
      _id: '663000000000000000000002',
      user: buyerId,
      orderId: '662000000000000000000001',
      type: 'escrow_lock',
      amount: -34.00,
      balanceAfter: 500.00,
      status: 'completed',
      note: 'Escrow payment locked for Order ACC-89210-ORD',
      createdAt: new Date(Date.now() - 3600000 * 24)
    },
    {
      _id: '663000000000000000000003',
      user: sellerId,
      orderId: '662000000000000000000001',
      type: 'escrow_release',
      amount: 32.30,
      balanceAfter: 420.00,
      status: 'completed',
      note: 'Escrow release payout for Order ACC-89210-ORD (5% fee deducted)',
      createdAt: new Date(Date.now() - 3600000 * 12)
    }
  ];

  reviews = [
    {
      _id: '664000000000000000000001',
      order: '662000000000000000000001',
      listing: listings[4]._id,
      seller: sellerId,
      buyer: buyerId,
      buyerName: 'Alex Gamer',
      rating: 5,
      comment: 'Super fast delivery! The Netflix 4K profile worked instantly with the provided PIN. Highly trusted seller.',
      createdAt: new Date(Date.now() - 3600000 * 10)
    }
  ];

  disputes = [];

  // If MongoDB is connected, populate Mongoose collections if empty
  if (isConnected()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.insertMany(users);
        await AccountListing.insertMany(listings);
        await Order.insertMany(orders);
        await Transaction.insertMany(transactions);
        await Review.insertMany(reviews);
        console.log('[Store] Seeded initial data into MongoDB database successfully.');
      }
    } catch (err) {
      console.error('[Store] MongoDB seed error:', err.message);
    }
  }
};

module.exports = {
  initSeedData,
  // Getter accessors
  getUsers: () => users,
  getListings: () => listings,
  getOrders: () => orders,
  getTransactions: () => transactions,
  getReviews: () => reviews,
  getDisputes: () => disputes,
  
  // Mutators for in-memory mode
  addUser: (user) => { users.unshift(user); return user; },
  addListing: (listing) => { listings.unshift(listing); return listing; },
  addOrder: (order) => { orders.unshift(order); return order; },
  addTransaction: (tx) => { transactions.unshift(tx); return tx; },
  addReview: (review) => { reviews.unshift(review); return review; },
  addDispute: (dispute) => { disputes.unshift(dispute); return dispute; },
  
  updateListing: (id, updates) => {
    const idx = listings.findIndex(l => l._id.toString() === id.toString());
    if (idx !== -1) {
      listings[idx] = { ...listings[idx], ...updates };
      return listings[idx];
    }
    return null;
  },

  updateOrder: (id, updates) => {
    const idx = orders.findIndex(o => o._id.toString() === id.toString());
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      return orders[idx];
    }
    return null;
  },

  updateUser: (id, updates) => {
    const idx = users.findIndex(u => u._id.toString() === id.toString());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      return users[idx];
    }
    return null;
  },

  updateDispute: (id, updates) => {
    const idx = disputes.findIndex(d => d._id.toString() === id.toString());
    if (idx !== -1) {
      disputes[idx] = { ...disputes[idx], ...updates };
      return disputes[idx];
    }
    return null;
  }
};
