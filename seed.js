require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Product  = require('./models/Product');

const products = [
  {
    name:'Air Jordan 1 Retro High', colorway:'Chicago Bulls', brand:'Air Jordan',
    category:'sneakers', price:5559, originalPrice:7000, discount:20,
    images:['images/aj 1 chichgo.png'],
    sizes:['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],
    colors:['Red','White','Black'], stock:25, sold:142,
    ratings:{ average:4.9, count:320 },
    tags:['jordan','retro','chicago','og','basketball'],
    isFeatured:true, isNewArrival:false
  },
  {
    name:'Nike Uptempo Slide', colorway:'Chicago Bulls', brand:'Nike',
    category:'sneakers', price:5559, originalPrice:6500, discount:15,
    images:['images/uptempo slide bulls.png'],
    sizes:['UK 6','UK 7','UK 8','UK 9','UK 10'],
    colors:['Red','Black'], stock:18, sold:87,
    ratings:{ average:4.7, count:210 },
    tags:['nike','uptempo','slide','bulls'],
    isFeatured:true, isNewArrival:false
  },
  {
    name:'Nike SB Dunk Low', colorway:'Gulf', brand:'Nike',
    category:'sneakers', price:5559, originalPrice:7200, discount:22,
    images:['images/sb gulf.png'],
    sizes:['UK 7','UK 8','UK 9','UK 10','UK 11'],
    colors:['Blue','Orange'], stock:12, sold:201,
    ratings:{ average:4.8, count:445 },
    tags:['nike','sb','dunk','low','gulf','collab'],
    isFeatured:true, isNewArrival:false
  },
  {
    name:'Adidas Campus', colorway:'Clear Sky Gum', brand:'Adidas',
    category:'sneakers', price:5559, originalPrice:6800, discount:18,
    images:['images/adidas campus clear sky gum.png'],
    sizes:['UK 6','UK 7','UK 8','UK 9','UK 10'],
    colors:['Blue','White','Gum'], stock:30, sold:65,
    ratings:{ average:4.6, count:178 },
    tags:['adidas','campus','clear sky','gum'],
    isFeatured:false, isNewArrival:true
  },
  {
    name:'Air Force 1 Low', colorway:'Lakers Home', brand:'Nike',
    category:'sneakers', price:5559, originalPrice:7000, discount:20,
    images:['images/af1 kobe yellow.png'],
    sizes:['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11','UK 12'],
    colors:['Yellow','Purple'], stock:22, sold:133,
    ratings:{ average:4.7, count:290 },
    tags:['nike','af1','lakers','kobe','yellow'],
    isFeatured:false, isNewArrival:false
  },
  {
    name:'Yeezy Boost 350 V2', colorway:'Zebra', brand:'Yeezy',
    category:'sneakers', price:5559, originalPrice:8000, discount:30,
    images:['images/yeezy zebra.png'],
    sizes:['UK 6','UK 7','UK 8','UK 9','UK 10'],
    colors:['White','Black'], stock:8, sold:310,
    ratings:{ average:4.9, count:502 },
    tags:['yeezy','350','v2','zebra','adidas','kanye'],
    isFeatured:true, isNewArrival:false
  },
  {
    name:'Yeezy 700 V3', colorway:'Azael', brand:'Yeezy',
    category:'sneakers', price:5559, originalPrice:9000, discount:38,
    images:['images/yzy 700 v3 azael.png'],
    sizes:['UK 7','UK 8','UK 9','UK 10'],
    colors:['Grey','Black','Neon'], stock:5, sold:178,
    ratings:{ average:4.8, count:267 },
    tags:['yeezy','700','v3','azael','adidas'],
    isFeatured:true, isNewArrival:false
  },
  {
    name:'Rick Owens Hollywood High', colorway:'Black Milk', brand:'Rick Owens',
    category:'sneakers', price:5559, originalPrice:12000, discount:53,
    images:['images/rick owens hollywood high black milk.png'],
    sizes:['UK 7','UK 8','UK 9','UK 10','UK 11'],
    colors:['Black','White'], stock:6, sold:44,
    ratings:{ average:4.9, count:89 },
    tags:['rick owens','hollywood','high','designer','luxury'],
    isFeatured:false, isNewArrival:true
  },
  {
    name:'Puma Melns', colorway:'La France', brand:'Puma',
    category:'sneakers', price:5559, originalPrice:6500, discount:14,
    images:['images/puma melons lafrance.png'],
    sizes:['UK 6','UK 7','UK 8','UK 9'],
    colors:['White','Red'], stock:20, sold:56,
    ratings:{ average:4.5, count:132 },
    tags:['puma','melns','la france'],
    isFeatured:false, isNewArrival:true
  },
  {
    name:'Travis x Fragment High', colorway:'Fragment', brand:'Air Jordan',
    category:'sneakers', price:5559, originalPrice:15000, discount:63,
    images:['images/travis x fragment high.png'],
    sizes:['UK 8','UK 9','UK 10','UK 11'],
    colors:['Black','White','Denim'], stock:3, sold:512,
    ratings:{ average:5.0, count:678 },
    tags:['travis scott','fragment','jordan','collab','limited'],
    isFeatured:true, isNewArrival:false
  },
  {
    name:'New Balance 990v5', colorway:'Grey', brand:'New Balance',
    category:'sneakers', price:5559, originalPrice:7500, discount:26,
    images:['images/nb 990v5.png'],
    sizes:['UK 7','UK 8','UK 9','UK 10','UK 11'],
    colors:['Grey','Silver'], stock:15, sold:189,
    ratings:{ average:4.8, count:356 },
    tags:['new balance','990','v5','grey','dad shoe'],
    isFeatured:false, isNewArrival:false
  },
  {
    name:'Air Jordan 4 Retro', colorway:'Breds', brand:'Air Jordan',
    category:'sneakers', price:5559, originalPrice:8000, discount:30,
    images:['images/aj4 bred.png'],
    sizes:['UK 7','UK 8','UK 9','UK 10'],
    colors:['Black','Red','Cement'], stock:9, sold:423,
    ratings:{ average:4.9, count:567 },
    tags:['jordan','aj4','retro','bred','og'],
    isFeatured:true, isNewArrival:false
  },
  {
    name:'Salehe Bembury x Crocs', colorway:'Horchata', brand:'Crocs',
    category:'accessories', price:5559, originalPrice:6000, discount:7,
    images:['images/crocs horchata.png'],
    sizes:['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],
    colors:['Cream','Brown'], stock:35, sold:201,
    ratings:{ average:4.6, count:289 },
    tags:['crocs','salehe bembury','horchata','collab','sandal'],
    isFeatured:false, isNewArrival:true
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔗  Connected to MongoDB\n');

  await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
  console.log('🗑️   Cleared existing data');

  // Admin
  await User.create({
    name: 'Heat Haven Admin',
    email: process.env.ADMIN_EMAIL || 'admin@heathaven.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
    phone: '9999999999'
  });
  console.log(`✅  Admin → ${process.env.ADMIN_EMAIL || 'admin@heathaven.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

  // Sample user
  await User.create({
    name: 'Kanishak Choudhary', email: 'kanishak@heathaven.com',
    password: 'password123', role: 'user', phone: '9205443488',
    size: 'UK 9', brands: ['Air Jordan','Nike','Yeezy'],
    address: { city: 'Delhi', state: 'Delhi', country: 'India' }
  });
  console.log('✅  User → kanishak@heathaven.com / password123');

  // Products
  await Product.insertMany(products);
  console.log(`✅  ${products.length} products seeded\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉  Database ready! Start server with: npm run dev');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

seed().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });
