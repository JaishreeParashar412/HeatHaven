const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

function computeTotals(subtotal) {
  const shipping = subtotal >= 50000 ? 0 : 1000;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;
  return { shipping, tax, total };
}

function buildOrderItems(cartItems) {
  return cartItems.map(i => ({
    productLegacyId: i.productLegacyId,
    name: i.product?.name || '',
    brand: i.product?.brand || '',
    colorway: i.product?.colorway || '',
    size: i.size,
    unitPrice: i.unitPrice,
    qty: i.qty,
    imageMain: i.imageMain,
  }));
}
async function placeOrder(req, res) {
  const { shippingAddress, notes, payment } = req.body || {};
  const pay = payment || {};
  const method = pay.method || 'netbanking';
  const bank = pay.bank || '';
  const simulateOutcome = pay.simulateOutcome; // optional deterministic testing

  const cart = await Cart.findOne({ userId: req.user._id }).lean();
  const cartItems = cart?.items || [];
  if (!cartItems.length) return res.status(400).json({ success: false, message: 'Your cart is empty.' });

  // Enrich items + validate stock.
  let subtotal = 0;
  const enriched = [];
  for (const item of cartItems) {
    const product = await Product.findOne({ legacyId: item.productLegacyId, isActive: true }).lean();
    if (!product) return res.status(400).json({ success: false, message: 'One or more products no longer exist.' });
    const variant = product.variants.find(v => v.size === item.size);
    if (!variant) return res.status(400).json({ success: false, message: `Size not available for ${product.name}.` });
    if (variant.stock < item.qty) {
      return res.status(400).json({ success: false, message: `Not enough stock for ${product.name} (${item.size}).` });
    }
    const unitPrice = item.unitPrice ?? variant.price;
    subtotal += unitPrice * item.qty;
    enriched.push({
      ...item,
      product,
      variant,
      unitPrice,
      imageMain: product.imageMain || item.imageMain,
    });
  }
