const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/products ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, featured, newArrival, page = 1, limit = 24 } = req.query;
    const q = { isActive: true };
    if (category)                q.category     = category;
    if (brand)                   q.brand        = new RegExp(brand, 'i');
    if (featured === 'true')     q.isFeatured   = true;
    if (newArrival === 'true')   q.isNewArrival = true;
    if (search) q.$or = [
      { name:     new RegExp(search, 'i') },
      { brand:    new RegExp(search, 'i') },
      { colorway: new RegExp(search, 'i') },
      { tags:     new RegExp(search, 'i') }
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(q);
    const products = await Product.find(q).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    res.json({ success: true, total, page: Number(page), products });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/products/:id ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/products (admin) ──────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json({ success: true, product: p });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ── PUT /api/products/:id (admin) ───────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product: p });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ── DELETE /api/products/:id (admin) ────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product deactivated.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/products/:id/wishlist ─────────────────────────
router.post('/:id/wishlist', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const pid  = req.params.id;
    const idx  = user.wishlist.findIndex(id => id.toString() === pid);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else           user.wishlist.push(pid);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
