const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const Razorpay = require('razorpay');
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const User     = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Init Razorpay (graceful – if keys missing, payment routes return 503)
let rzp;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes('XXXX')) {
    rzp = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('💳  Razorpay initialised.');
  } else {
    console.warn('⚠️   Razorpay keys not set – running in DEMO mode (no real payments).');
  }
} catch (e) { console.warn('⚠️   Razorpay init error:', e.message); }

// ── POST /api/orders/create-razorpay-order ──────────────────
router.post('/create-razorpay-order', protect, async (req, res) => {
  if (!rzp) return res.status(503).json({ success: false, message: 'Payment gateway not configured. Add Razorpay keys to .env' });
  try {
    const rzpOrder = await rzp.orders.create({
      amount:   Math.round(req.body.grandTotal * 100),
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`
    });
    res.json({ success: true, order: rzpOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/orders  (place order + verify payment) ────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      items, shippingAddress,
      subtotal, shippingCharge, tax, grandTotal,
      razorpayOrderId, razorpayPaymentId, razorpaySignature
    } = req.body;

    // Verify Razorpay signature when payment is provided
    let paymentStatus = 'pending';
    let orderStatus   = 'pending';

    if (rzp && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      if (expected !== razorpaySignature)
        return res.status(400).json({ success: false, message: 'Payment verification failed – signature mismatch.' });
      paymentStatus = 'paid';
      orderStatus   = 'confirmed';
    } else if (!rzp) {
      // DEMO mode – auto-confirm
      paymentStatus = 'paid';
      orderStatus   = 'confirmed';
    }

    const order = await Order.create({
      user: req.user._id,
      items, shippingAddress,
      subtotal:       subtotal       || 0,
      shippingCharge: shippingCharge || 0,
      tax:            tax            || 0,
      grandTotal,
      status:        orderStatus,
      paymentStatus,
      razorpayOrderId:   razorpayOrderId   || '',
      razorpayPaymentId: razorpayPaymentId || '',
      razorpaySignature: razorpaySignature || ''
    });

    // Update stock + sold
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { sold: item.qty, stock: -item.qty }
      });
    }
    await User.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } });

    res.status(201).json({ success: true, order });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/orders/my ──────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');
    res.json({ success: true, orders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/orders/:id ─────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied.' });
    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/orders (admin) ─────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const q    = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [total, orders] = await Promise.all([
      Order.countDocuments(q),
      Order.find(q).skip(skip).limit(Number(limit)).sort({ createdAt: -1 })
        .populate('user', 'name email')
        .populate('items.product', 'name images')
    ]);
    res.json({ success: true, total, orders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── PUT /api/orders/:id/status (admin) ──────────────────────
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, updatedAt: Date.now() },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
