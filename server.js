const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const SECRET = process.env.APP_SECRET || 'change-this-secret-before-production';

const menu = [
  { id: 1, restaurant: 'Burger Junction', name: 'Classic Veg Burger', description: 'Grilled vegetable patty, lettuce and house sauce', price: 149, category: 'Burgers', emoji: '??' },
  { id: 2, restaurant: 'Burger Junction', name: 'Crispy Chicken Burger', description: 'Crunchy chicken fillet, pickles and smoky mayo', price: 199, category: 'Burgers', emoji: '??' },
  { id: 3, restaurant: 'Pizza Palace', name: 'Margherita Pizza', description: 'Tomato, mozzarella and fresh basil', price: 299, category: 'Pizza', emoji: '??' },
  { id: 4, restaurant: 'Pizza Palace', name: 'Farmhouse Pizza', description: 'Bell pepper, onion, mushroom and olives', price: 349, category: 'Pizza', emoji: '??' },
  { id: 5, restaurant: 'Spice Garden', name: 'Paneer Tikka Masala', description: 'Chargrilled paneer in a creamy tomato gravy', price: 279, category: 'Indian', emoji: '??' },
  { id: 6, restaurant: 'Spice Garden', name: 'Butter Naan Combo', description: 'Two butter naans with aromatic dal makhani', price: 189, category: 'Indian', emoji: '??' },
  { id: 7, restaurant: 'Dosa House', name: 'Masala Dosa', description: 'Crisp dosa with potato masala, sambar and chutney', price: 179, category: 'South Indian', emoji: '??' },
  { id: 8, restaurant: 'Dosa House', name: 'Idli Vada Plate', description: 'Soft idlis, crisp vada, sambar and chutneys', price: 129, category: 'South Indian', emoji: '???' },
  { id: 9, restaurant: 'Biryani Blues', name: 'Hyderabadi Chicken Biryani', description: 'Fragrant basmati rice, chicken and raita', price: 329, category: 'Biryani', emoji: '??' },
  { id: 10, restaurant: 'Biryani Blues', name: 'Veg Dum Biryani', description: 'Slow-cooked vegetables, basmati and salan', price: 249, category: 'Biryani', emoji: '??' },
  { id: 11, restaurant: 'Wok This Way', name: 'Hakka Noodles', description: 'Wok-tossed noodles with fresh vegetables', price: 199, category: 'Chinese', emoji: '??' },
  { id: 12, restaurant: 'Wok This Way', name: 'Chilli Chicken', description: 'Crispy chicken in a spicy Indo-Chinese sauce', price: 259, category: 'Chinese', emoji: '??' },
  { id: 13, restaurant: 'The Salad Bowl', name: 'Paneer Tikka Bowl', description: 'Tandoori paneer, rice, greens and mint chutney', price: 259, category: 'Healthy', emoji: '??' },
  { id: 14, restaurant: 'The Salad Bowl', name: 'Protein Power Bowl', description: 'Quinoa, chickpeas, avocado and roasted vegetables', price: 289, category: 'Healthy', emoji: '??' },
  { id: 15, restaurant: 'Wrap & Roll', name: 'Spicy Chicken Wrap', description: 'Roasted chicken, crunchy slaw and chipotle mayo', price: 219, category: 'Wraps', emoji: '??' },
  { id: 16, restaurant: 'Wrap & Roll', name: 'Paneer Kathi Roll', description: 'Paneer, onion and tangy chutneys in a paratha', price: 189, category: 'Wraps', emoji: '??' },
  { id: 17, restaurant: 'Coastal Catch', name: 'Fish Curry Rice', description: 'Kerala-style fish curry with steamed rice', price: 319, category: 'Seafood', emoji: '??' },
  { id: 18, restaurant: 'Coastal Catch', name: 'Prawn Fry', description: 'Crisp coastal masala prawns with lemon', price: 349, category: 'Seafood', emoji: '??' },
  { id: 19, restaurant: 'Momo Mania', name: 'Steamed Veg Momos', description: 'Eight vegetable dumplings with chilli dip', price: 159, category: 'Snacks', emoji: '??' },
  { id: 20, restaurant: 'Momo Mania', name: 'Chicken Fried Momos', description: 'Golden fried momos tossed in chilli garlic sauce', price: 219, category: 'Snacks', emoji: '??' },
  { id: 21, restaurant: 'Chaat Street', name: 'Pani Puri', description: 'Six crisp puris with spicy mint water', price: 89, category: 'Street Food', emoji: '??' },
  { id: 22, restaurant: 'Chaat Street', name: 'Raj Kachori', description: 'Crisp kachori with curd, chutney and sev', price: 139, category: 'Street Food', emoji: '??' },
  { id: 23, restaurant: 'Sweet Truth', name: 'Chocolate Brownie', description: 'Warm brownie with a rich chocolate centre', price: 109, category: 'Dessert', emoji: '??' },
  { id: 24, restaurant: 'Sweet Truth', name: 'Gulab Jamun', description: 'Four soft milk dumplings in rose syrup', price: 119, category: 'Dessert', emoji: '??' },
  { id: 25, restaurant: 'Brew & Bean', name: 'Cold Coffee', description: 'Creamy chilled coffee with vanilla foam', price: 129, category: 'Drinks', emoji: '?' },
  { id: 26, restaurant: 'Brew & Bean', name: 'Fresh Lime Soda', description: 'Sparkling lime drink, salted or sweet', price: 69, category: 'Drinks', emoji: '??' },
  { id: 27, restaurant: 'Taco Town', name: 'Mexican Veg Tacos', description: 'Three crispy tacos with beans, salsa and cheese', price: 219, category: 'Mexican', emoji: '??' },
  { id: 28, restaurant: 'Taco Town', name: 'Loaded Nachos', description: 'Corn chips, beans, cheese sauce, salsa and jalapeños', price: 199, category: 'Mexican', emoji: '??' },
  { id: 29, restaurant: 'Kebab Kitchen', name: 'Chicken Seekh Kebab', description: 'Four juicy charcoal-grilled kebabs with mint dip', price: 279, category: 'Kebabs', emoji: '??' },
  { id: 30, restaurant: 'Kebab Kitchen', name: 'Veg Galouti Kebab', description: 'Melt-in-mouth vegetable kebabs with roomali roti', price: 229, category: 'Kebabs', emoji: '??' }
];

// Demo account: demo@tastebite.in / welcome123. Replace this in production with a database and OAuth/Identity Platform.
const users = [{ id: 1, name: 'Demo Customer', email: 'demo@tastebite.in', passwordHash: hash('welcome123') }];
const orders = [];

function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}
function tokenFor(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
function userFromRequest(req) {
  const raw = req.headers.authorization || '';
  if (!raw.startsWith('Bearer ')) return null;
  const [payload, signature] = raw.slice(7).split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (!payload || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? users.find(u => u.id === data.id) : null;
  } catch { return null; }
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('Invalid JSON')); } });
  });
}
function serveStatic(req, res) {
  const requested = req.url === '/' ? '/login.html' : req.url.split('?')[0];
  const file = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return false;
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
  res.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'application/octet-stream'}; charset=utf-8` });
  fs.createReadStream(file).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/menu') return send(res, 200, { items: menu });
    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const { email, password } = await readBody(req);
      const user = users.find(u => u.email === String(email).toLowerCase() && u.passwordHash === hash(String(password)));
      if (!user) return send(res, 401, { error: 'Incorrect email or password.' });
      return send(res, 200, { token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
    }
    if (req.method === 'POST' && req.url === '/api/auth/register') {
      const { name, email, password } = await readBody(req);
      if (!name || !email || String(password).length < 6) return send(res, 400, { error: 'Name, a valid email and a 6-character password are required.' });
      if (users.some(u => u.email === String(email).toLowerCase())) return send(res, 409, { error: 'An account with this email already exists.' });
      const user = { id: users.length + 1, name: String(name).trim(), email: String(email).toLowerCase(), passwordHash: hash(String(password)) };
      users.push(user);
      return send(res, 201, { token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
    }
    if (req.method === 'POST' && req.url === '/api/orders') {
      const user = userFromRequest(req);
      if (!user) return send(res, 401, { error: 'Please log in to place an order.' });
      const { items, address, paymentMethod, couponCode } = await readBody(req);
      if (!Array.isArray(items) || !items.length || !address?.trim()) return send(res, 400, { error: 'Cart and delivery address are required.' });
      const orderItems = items.map(({ id, quantity }) => {
        const item = menu.find(m => m.id === Number(id));
        return item && { ...item, quantity: Math.max(1, Number(quantity) || 1) };
      }).filter(Boolean);
      if (!orderItems.length) return send(res, 400, { error: 'Your cart contains unavailable items.' });
      const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
      const deliveryFee = subtotal >= 299 ? 0 : 39;
      const coupon = String(couponCode || '').trim().toUpperCase();
      const couponRules = { WELCOME50: { minimum: 299, discount: 50 }, SAVE100: { minimum: 699, discount: 100 } };
      if (coupon && (!couponRules[coupon] || subtotal < couponRules[coupon].minimum)) return send(res, 400, { error: coupon ? 'Coupon is invalid or its minimum order value is not met.' : 'Invalid coupon.' });
      const couponDiscount = coupon ? couponRules[coupon].discount : 0;
      const payment = paymentMethod || 'Cash on delivery';
      const paymentDiscountRate = payment === 'Credit / Debit card' ? 0.10 : payment === 'UPI' ? 0.05 : 0;
      const paymentDiscount = Math.round((subtotal - couponDiscount) * paymentDiscountRate);
      const total = Math.max(0, subtotal + deliveryFee - couponDiscount - paymentDiscount);
      const createdAt = new Date().toISOString();
      const order = { id: `TB${Date.now().toString().slice(-7)}`, userId: user.id, items: orderItems, address: address.trim(), paymentMethod: payment, couponCode: coupon || null, subtotal, deliveryFee, couponDiscount, paymentDiscount, total, status: 'Restaurant accepted your order', tracking: [{ label: 'Order confirmed', detail: 'Your order has been sent to the restaurant.' }, { label: 'Restaurant is preparing your food', detail: 'Estimated preparation time: 15 minutes.' }, { label: 'Rider will pick up your order', detail: 'We will notify you when the rider leaves.' }, { label: 'Out for delivery', detail: 'Your order is on the way to your address.' }, { label: 'Delivered', detail: 'Enjoy your meal!' }], createdAt };
      orders.push(order);
      return send(res, 201, { order });
    }    if (req.method === 'GET' && req.url === '/health') return send(res, 200, { status: 'ok' });
    if (req.method === 'GET' && serveStatic(req, res)) return;
    send(res, 404, { error: 'Not found' });
  } catch (error) { send(res, 500, { error: error.message || 'Server error' }); }
});
server.listen(PORT, () => console.log(`TasteBite running at http://localhost:${PORT}`));
