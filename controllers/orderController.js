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

