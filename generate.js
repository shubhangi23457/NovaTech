const fs = require('fs');

const raw = fs.readFileSync('raw_products.txt', 'utf8').split('\n').map(l => l.trim()).filter(l => l);

const products = [];

const categories = ['Audio', 'Computing', 'Mobile', 'Smart Home'];

const badges = ['', 'NEW', 'DEAL', 'BESTSELLER', 'HOT', 'PREMIUM', 'SALE'];

function getCategory(name) {
    name = name.toLowerCase();
    if (name.includes('phone') || name.includes('tablet') || name.includes('watch') || name.includes('charger')) return 'Mobile';
    if (name.includes('audio') || name.includes('head') || name.includes('ear') || name.includes('speaker') || name.includes('mic')) return 'Audio';
    if (name.includes('pc') || name.includes('laptop') || name.includes('drive') || name.includes('mouse') || name.includes('keyboard')) return 'Computing';
    if (name.includes('smart') || name.includes('home') || name.includes('bulb') || name.includes('plug')) return 'Smart Home';
    return categories[Math.floor(Math.random() * categories.length)];
}

raw.forEach((name, i) => {
    // skip generic category headers if we want, but let's just add everything as a product
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + i;
    const cat = getCategory(name);
    
    // random price between 999 and 99999
    const price = Math.floor(Math.random() * (99999 - 999) + 999);
    const oldPrice = Math.floor(price * (1 + Math.random() * 0.5));
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    const badge = badges[Math.floor(Math.random() * badges.length)];
    
    // generate a loremflickr URL with a relevant keyword
    const keyword1 = encodeURIComponent(name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''));
    const keyword2 = 'electronics';
    // Using a random seed in URL so they don't all look the same if they have the same keyword
    const image = `https://loremflickr.com/700/700/${keyword1},${keyword2}/all?lock=${i}`;
    
    products.push(`  { id: '${id}', name: '${name.replace(/'/g, "\\'")}', category: '${cat}', price: ${price}, oldPrice: ${oldPrice}, rating: '${rating}', badge: '${badge}', image: '${image}', description: 'Experience the latest ${name.replace(/'/g, "\\'")} with premium quality and outstanding performance.' }`);
});

const content = `\n  // ── Auto Generated Products ──\n` + products.join(',\n') + '\n';

const script = fs.readFileSync('script.js', 'utf8');

// replace the end of the products array with the new products
const newScript = script.replace('];\n\n/* Gift Card Data */', content + '];\n\n/* Gift Card Data */');
fs.writeFileSync('script.js', newScript);
console.log('Added ' + products.length + ' products to script.js');
