const Product = require('../models/Product');

function parseNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function getProducts(req, res) {
  const { category, brand, q, minPrice, maxPrice } = req.query || {};
  const min = minPrice !== undefined ? parseNumber(minPrice) : undefined;
  const max = maxPrice !== undefined ? parseNumber(maxPrice) : undefined;

  const filter = { isActive: true };
  if (category) filter.category = String(category);
  if (brand) filter.brand = String(brand);

  let products = await Product.find(filter).lean();

  if (q) {
    const query = String(q).toLowerCase();
    products = products.filter(
      p =>
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.colorway?.toLowerCase().includes(query)
    );
  }

  if (min !== undefined || max !== undefined) {
    products = products.filter(p => {
      const prices = (p.variants || []).map(v => v.price);
      const inRange = prices.some(price => {
        if (min !== undefined && price < min) return false;
        if (max !== undefined && price > max) return false;
        return true;
      });
      return inRange;
    });
  }

  res.json({ success: true, data: products });
}
