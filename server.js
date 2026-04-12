require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── DB ──────────────────────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000','http://127.0.0.1:5500','http://localhost:5500','http://localhost:8080','*'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Serve frontend static files ─────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/admin',    require('./routes/admin'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_, res) =>
  res.json({ success: true, message: '🔥 Heat Haven API running!', time: new Date() })
);

// ── SPA fallback ─────────────────────────────────────────────
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
);

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🔥  Heat Haven  →  http://localhost:${PORT}`);
  console.log(`📡  API ready   →  http://localhost:${PORT}/api/health\n`);
});
