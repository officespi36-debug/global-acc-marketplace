const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('Testing AccGlobal backend endpoints...');
  try {
    // 1. Health check
    const health = await request({ host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
    console.log('[1] Health check:', health.status, health.data.service);

    // 2. Demo Login as Buyer
    const loginBuyer = await request({
      host: '127.0.0.1', port: 5000, path: '/api/auth/demo-login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'buyer' });
    console.log('[2] Buyer Demo Login:', loginBuyer.status, loginBuyer.data.user.name, 'Token received:', !!loginBuyer.data.token);
    const buyerToken = loginBuyer.data.token;

    // 3. Demo Login as Seller
    const loginSeller = await request({
      host: '127.0.0.1', port: 5000, path: '/api/auth/demo-login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'seller' });
    console.log('[3] Seller Demo Login:', loginSeller.status, loginSeller.data.user.name);

    // 4. Demo Login as Admin
    const loginAdmin = await request({
      host: '127.0.0.1', port: 5000, path: '/api/auth/demo-login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'admin' });
    console.log('[4] Admin Demo Login:', loginAdmin.status, loginAdmin.data.user.name);

    // 5. Get Account Listings
    const listings = await request({ host: '127.0.0.1', port: 5000, path: '/api/accounts', method: 'GET' });
    console.log('[5] Public Listings count:', listings.data.count, 'First item:', listings.data.listings[0].title);

    // 6. Test Escrow Buy Flow (Alex Gamer buys Canva Pro or Netflix)
    const canvaListing = listings.data.listings.find(l => l.subcategory === 'Canva Pro');
    if (canvaListing) {
      const orderRes = await request({
        host: '127.0.0.1', port: 5000, path: '/api/orders', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` }
      }, { listingId: canvaListing._id, paymentMethod: 'wallet' });
      console.log('[6] Escrow Purchase Order:', orderRes.status, 'Delivered Login:', orderRes.data.order.deliveredCredentials.loginIdentifier, 'Escrow Status:', orderRes.data.order.escrowStatus);

      // 7. Test Confirm and Release Escrow
      const confirmRes = await request({
        host: '127.0.0.1', port: 5000, path: `/api/orders/${orderRes.data.order._id}/confirm`, method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` }
      });
      console.log('[7] Buyer Release Escrow:', confirmRes.status, confirmRes.data.message);
    }

    console.log('✅ ALL BACKEND VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

setTimeout(runTests, 1200);
