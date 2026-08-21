const fs = require('fs');

// Brand pools per category — realistic brand assignments
const brandsByCategory = {
  'Mobile': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Motorola', 'Realme', 'Nothing'],
  'Computing': ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Microsoft'],
  'Audio': ['Sony', 'JBL', 'boAt', 'Bose', 'Sennheiser', 'Samsung', 'Apple'],
  'Smart Home': ['Philips', 'Amazon', 'Google', 'TP-Link', 'Samsung', 'Anker'],
};

// Specific brand overrides for product names that strongly imply a brand
const nameOverrides = {
  'gaming laptops':           ['ASUS', 'MSI', 'Lenovo', 'HP', 'Acer'],
  'business laptops':         ['Dell', 'HP', 'Lenovo', 'ASUS'],
  'gaming mice':              ['Razer', 'Logitech', 'Corsair'],
  'gaming keyboards':         ['Razer', 'Corsair', 'Logitech'],
  'gaming headsets':          ['Razer', 'Corsair', 'Sony', 'Logitech'],
  'mechanical keyboards':     ['Corsair', 'Razer', 'Logitech'],
  'wireless keyboards':       ['Logitech', 'Apple', 'Microsoft'],
  'wireless mice':            ['Logitech', 'Apple', 'Razer'],
  'gaming monitors':          ['ASUS', 'Samsung', 'LG', 'MSI'],
  'monitors':                 ['Dell', 'LG', 'Samsung', 'ASUS'],
  'dslr cameras':             ['Canon', 'Nikon'],
  'mirrorless cameras':       ['Sony', 'Canon', 'Nikon'],
  'action cameras':           ['GoPro'],
  'webcams':                  ['Logitech'],
  'smartwatches':             ['Apple', 'Samsung', 'Garmin'],
  'fitness bands':            ['Samsung', 'Xiaomi', 'Apple'],
  'smart speakers':           ['Amazon', 'Google', 'Apple'],
  'smart tvs':                ['Samsung', 'LG', 'Sony'],
  'led tvs':                  ['Samsung', 'LG', 'Sony'],
  'oled tvs':                 ['LG', 'Sony', 'Samsung'],
  'qled tvs':                 ['Samsung'],
  '4k tvs':                   ['Samsung', 'LG', 'Sony'],
  '8k tvs':                   ['Samsung', 'Sony'],
  'wi-fi routers':            ['TP-Link', 'Netgear', 'ASUS'],
  'mesh wi-fi systems':       ['TP-Link', 'Netgear', 'Google'],
  'wi-fi extenders':          ['TP-Link', 'Netgear', 'Anker'],
  'soundbars':                ['Sony', 'JBL', 'Samsung', 'Bose'],
  'wireless earbuds':         ['Apple', 'Samsung', 'Sony', 'boAt', 'JBL'],
  'over-ear headphones':      ['Sony', 'Bose', 'Sennheiser', 'JBL'],
  'on-ear headphones':        ['Sony', 'Sennheiser', 'JBL', 'Bose'],
  'bluetooth speakers':       ['JBL', 'Sony', 'boAt', 'Bose'],
  'portable speakers':        ['JBL', 'Sony', 'boAt', 'Anker'],
  'power banks':              ['Anker', 'Samsung', 'Xiaomi', 'OnePlus'],
  'fast chargers':            ['Anker', 'OnePlus', 'Samsung', 'Apple'],
  'wireless chargers':        ['Anker', 'Samsung', 'Apple', 'Belkin'],
  'graphics cards':           ['NVIDIA', 'AMD', 'ASUS', 'MSI'],
  'gaming consoles':          ['Sony', 'Microsoft', 'Nintendo'],
  'handheld gaming consoles': ['Nintendo', 'Sony'],
  'vr headsets':              ['Meta', 'Sony', 'Samsung'],
  'smartphones':              ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Motorola', 'Realme', 'Nothing'],
  'tablets':                  ['Apple', 'Samsung', 'Lenovo'],
  'laptops':                  ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
  'gaming pcs':               ['ASUS', 'MSI', 'Corsair', 'Dell'],
  'ssds':                     ['Samsung', 'WD', 'Seagate', 'Kingston'],
  'hdds':                     ['Seagate', 'WD', 'Toshiba'],
  'external hard drives':     ['Seagate', 'WD', 'Toshiba'],
  'external ssds':            ['Samsung', 'WD', 'SanDisk'],
  'usb flash drives':         ['SanDisk', 'Kingston', 'Samsung'],
  'memory cards':             ['SanDisk', 'Samsung', 'Kingston'],
  'inkjet printers':          ['HP', 'Canon', 'Epson'],
  'laser printers':           ['HP', 'Canon', 'Epson', 'Brother'],
  'all-in-one printers':      ['HP', 'Canon', 'Epson'],
  'photo printers':           ['Canon', 'Epson', 'HP'],
  '3d printers':              ['Creality', 'Bambu Lab', 'Prusa'],
  'cpus':                     ['Intel', 'AMD'],
  'motherboards':             ['ASUS', 'MSI', 'Gigabyte'],
  'ram':                      ['Corsair', 'G.Skill', 'Kingston'],
  'gaming chairs':            ['Secretlab', 'DXRacer', 'Herman Miller'],
};

let script = fs.readFileSync('script.js', 'utf8');

let count = 0;

// Match auto-generated product lines and add a brand field
script = script.replace(
  /\{ id: '([^']+)', name: '([^']+)', category: '([^']+)', price: (\d+), oldPrice: (\d+), rating: '([^']+)', badge: '([^']*)', image: '([^']+)', description: '([^']+)' \}/g,
  (match, id, name, category, price, oldPrice, rating, badge, image, description) => {
    // Skip if already has a brand field
    if (match.includes("brand: '")) return match;

    const nameLower = name.toLowerCase();
    let brandPool = nameOverrides[nameLower] || brandsByCategory[category] || ['NovaTech'];
    
    // Use id hash to pick a consistent brand (not fully random each time)
    const hashVal = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const brand = brandPool[hashVal % brandPool.length];

    count++;
    return `{ id: '${id}', name: '${name}', category: '${category}', price: ${price}, oldPrice: ${oldPrice}, rating: '${rating}', badge: '${badge}', brand: '${brand}', image: '${image}', description: '${description}' }`;
  }
);

fs.writeFileSync('script.js', script);
console.log(`✅ Added brand field to ${count} products.`);
