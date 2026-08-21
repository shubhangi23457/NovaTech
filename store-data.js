/**
 * NovaTech Central Store Dataset & State Management Utility
 * Shared across index.html, product.html, account.html, wishlist.html, orders.html, etc.
 */

// HTML Sanitization Helper to prevent XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function (match) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[match];
  });
}

const NOVATECH_PRODUCTS = [
  // --- AUDIO (6 Products) ---
  {
    id: 'nova-x1',
    name: 'Nova X1 Wireless Headphones',
    category: 'Audio',
    price: 9999,
    oldPrice: 12999,
    rating: 4.9,
    reviewsCount: 342,
    badge: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85',
    description: 'Immersive over-ear audio with adaptive noise cancelling, custom 40mm titanium drivers, and a remarkable 40-hour battery life.',
    stock: true,
    brand: 'NovaTech',
    deal: true,
    featured: true,
    discount: 23,
    createdAt: '2026-02-01',
    tags: ['wireless', 'anc', 'audio', 'headphones'],
    specifications: {
      'Driver Size': '40mm Titanium Dynamic',
      'Battery Life': 'Up to 40 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.3 & 3.5mm Aux',
      'Weight': '254g',
      'Noise Cancelling': 'Adaptive Hybrid ANC (4 mics)',
      'Warranty': '2 Years Official Warranty'
    }
  },
  {
    id: 'astra-buds',
    name: 'Astra Buds Pro ANC',
    category: 'Audio',
    price: 6499,
    oldPrice: 7999,
    rating: 4.8,
    reviewsCount: 218,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85',
    description: 'Pocket-sized precision with ultra-clear spatial audio, 32dB active noise cancellation, and IPX5 water resistance.',
    stock: true,
    brand: 'Astra',
    deal: true,
    featured: true,
    discount: 18,
    createdAt: '2026-02-05',
    tags: ['earbuds', 'wireless', 'anc', 'audio'],
    specifications: {
      'ANC Depth': 'Up to 32dB',
      'Playback': '8 hours (30 hours with case)',
      'Water Resistance': 'IPX5 Sweat & Water Proof',
      'Charging': 'Wireless & USB-C Fast Charge',
      'Weight': '4.2g per earbud',
      'Warranty': '1 Year Replacement Warranty'
    }
  },
  {
    id: 'flux-speaker',
    name: 'Flux Mini Portable Speaker',
    category: 'Audio',
    price: 3499,
    oldPrice: 4499,
    rating: 4.7,
    reviewsCount: 95,
    badge: 'SAVE 22%',
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=85',
    description: '360° omnidirectional sound with dual passive radiators, 14-hour playtime, and IP67 dust and waterproof enclosure.',
    stock: true,
    brand: 'NovaTech',
    deal: true,
    featured: false,
    discount: 22,
    createdAt: '2026-01-20',
    tags: ['speaker', 'bluetooth', 'audio', 'outdoor'],
    specifications: {
      'Output Power': '20W RMS Peak',
      'Battery': '14 Hours Playback',
      'Protection': 'IP67 Dustproof & Waterproof',
      'Weight': '480g',
      'Wireless Range': '15 Meters'
    }
  },
  {
    id: 'pulse-bar',
    name: 'Pulse Soundbar 300W with Subwoofer',
    category: 'Audio',
    price: 14999,
    oldPrice: 18999,
    rating: 4.7,
    reviewsCount: 88,
    badge: 'CINEMA SOUND',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=85',
    description: '3.1 channel cinema soundbar with wireless down-firing subwoofer, eARC HDMI connection, and Bluetooth 5.2 audio streaming.',
    stock: true,
    brand: 'Pulse',
    deal: false,
    featured: false,
    discount: 21,
    createdAt: '2026-01-15',
    tags: ['soundbar', 'audio', 'home theater'],
    specifications: {
      'Total Output': '300W Peak Power',
      'Subwoofer': '6.5” Wireless Subwoofer',
      'Inputs': 'HDMI eARC, Optical, AUX, Bluetooth 5.2',
      'Sound Modes': 'Movie, Music, Voice Boost, Night Mode'
    }
  },
  {
    id: 'echo-studio',
    name: 'Echo Studio Hi-Fi Wireless Speaker',
    category: 'Audio',
    price: 8999,
    oldPrice: 10999,
    rating: 4.8,
    reviewsCount: 114,
    badge: 'HI-RES AUDIO',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=85',
    description: 'Studio-grade acoustics with 5 directional speakers, Dolby Atmos processing, and room-adaptive acoustic tuning.',
    stock: true,
    brand: 'Echo',
    deal: false,
    featured: true,
    discount: 18,
    createdAt: '2026-01-10',
    tags: ['hi-fi', 'speaker', 'audio', 'dolby'],
    specifications: {
      'Speakers': '1x 5.25" Woofer, 3x 2" Midrange, 1x 1" Tweeter',
      'Audio Formats': 'Dolby Atmos, Sony 360 Reality Audio',
      'DAC': '24-bit 100 kHz Hi-Res DAC'
    }
  },
  {
    id: 'sonic-dj',
    name: 'Sonic Pro DJ Studio Headphones',
    category: 'Audio',
    price: 11499,
    oldPrice: 13999,
    rating: 4.9,
    reviewsCount: 76,
    badge: 'PRO GEAR',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=85',
    description: 'Professional closed-back monitoring headphones featuring 50mm neodymium magnet drivers and 90° swivelling earcups.',
    stock: true,
    brand: 'Sonic',
    deal: false,
    featured: false,
    discount: 17,
    createdAt: '2026-01-28',
    tags: ['dj', 'studio', 'audio', 'wired'],
    specifications: {
      'Driver Size': '50mm Neodymium',
      'Frequency Response': '15Hz - 28,000Hz',
      'Impedance': '38 Ohms'
    }
  },

  // --- COMPUTING (6 Products) ---
  {
    id: 'arc-monitor',
    name: 'Arc 34” Ultrawide OLED Display',
    category: 'Computing',
    price: 48990,
    oldPrice: 64990,
    rating: 4.8,
    reviewsCount: 294,
    badge: 'DEAL OF DAY',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=85',
    description: 'A vivid 1800R curved Ultrawide OLED canvas with 165Hz refresh rate, 0.03ms response time, and 99.3% DCI-P3 color gamut.',
    stock: true,
    brand: 'NovaTech',
    deal: true,
    featured: true,
    discount: 24,
    createdAt: '2026-02-07',
    tags: ['monitor', 'oled', '165hz', 'gaming', 'computing'],
    specifications: {
      'Screen Size': '34 Inches Curved 1800R',
      'Panel Type': 'Quantum Dot OLED',
      'Resolution': '3440 x 1440 UWQHD',
      'Refresh Rate': '165Hz',
      'Response Time': '0.03ms (GtG)',
      'Ports': '2x HDMI 2.1, 1x DP 1.4, 90W USB-C'
    }
  },
  {
    id: 'keyframe-75',
    name: 'Keyframe 75 Custom Mechanical Keyboard',
    category: 'Computing',
    price: 7499,
    oldPrice: 8999,
    rating: 4.9,
    reviewsCount: 156,
    badge: 'EDITOR’S CHOICE',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=85',
    description: 'Tactile 75% compact wireless keyboard featuring hot-swappable yellow linear switches, gasket mount design, and PBT keycaps.',
    stock: true,
    brand: 'Keyframe',
    deal: false,
    featured: true,
    discount: 16,
    createdAt: '2026-01-25',
    tags: ['keyboard', 'mechanical', 'wireless', 'computing'],
    specifications: {
      'Layout': '75% Compact (82 Keys)',
      'Switches': 'Factory-Lubed Custom Linear',
      'Structure': 'Gasket Mount with Dampening Foam',
      'Connectivity': 'Bluetooth 5.1, 2.4G & Type-C',
      'Battery': '4000mAh RGB (200 hours off)'
    }
  },
  {
    id: 'vector-laptop',
    name: 'Vector Pro 16 M3 Creator Laptop',
    category: 'Computing',
    price: 124990,
    oldPrice: 139990,
    rating: 4.9,
    reviewsCount: 47,
    badge: 'FLAGSHIP',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra-thin aluminum creator laptop featuring Liquid Retina XDR 120Hz display, M3 Pro 12-core chip, 32GB RAM, and 22-hour battery.',
    stock: true,
    brand: 'Vector',
    deal: false,
    featured: true,
    discount: 11,
    createdAt: '2026-02-03',
    tags: ['laptop', 'computing', 'm3', 'pro'],
    specifications: {
      'Processor': 'Vector M3 Pro 12-Core CPU / 18-Core GPU',
      'Memory / Storage': '32GB Unified Memory / 1TB PCIe Gen4 SSD',
      'Display': '16.2” Liquid Retina XDR 120Hz (1600 nits peak)',
      'Battery': 'Up to 22 Hours Battery Life',
      'Weight': '2.14 kg CNC Aluminum Chassis'
    }
  },
  {
    id: 'swift-mouse',
    name: 'Swift Precision Ergonomic Wireless Mouse',
    category: 'Computing',
    price: 3999,
    oldPrice: 4999,
    rating: 4.8,
    reviewsCount: 165,
    badge: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=85',
    description: 'Ergonomic wireless productivity mouse with MagSpeed electromagnetic scrolling, 8K DPI track-on-glass sensor, and quiet clicks.',
    stock: true,
    brand: 'Swift',
    deal: false,
    featured: false,
    discount: 20,
    createdAt: '2026-01-18',
    tags: ['mouse', 'wireless', 'computing', 'productivity'],
    specifications: {
      'Sensor': 'Darkfield 8000 DPI Precision',
      'Scroll Wheel': 'MagSpeed SmartShift 1000 lines/sec',
      'Battery': '70 Days Full Charge (3 hrs from 1 min charge)'
    }
  },
  {
    id: 'zenith-dock',
    name: 'Zenith Thunderbolt 4 Dual-Monitor Dock',
    category: 'Computing',
    price: 12999,
    oldPrice: 15999,
    rating: 4.7,
    reviewsCount: 52,
    badge: 'WORKSTATION',
    image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=85',
    description: '12-in-1 aluminium Thunderbolt 4 workstation hub supporting dual 4K 60Hz displays, 96W host charging, 2.5G Ethernet, and SD 4.0.',
    stock: true,
    brand: 'Zenith',
    deal: true,
    featured: false,
    discount: 18,
    createdAt: '2026-01-12',
    tags: ['dock', 'thunderbolt', 'hub', 'computing'],
    specifications: {
      'Ports': '3x TB4, 4x USB-A 10Gbps, 2.5G LAN, SD/TF, 96W PD',
      'Display Output': 'Dual 4K @ 60Hz or Single 8K @ 30Hz'
    }
  },
  {
    id: 'omni-pad',
    name: 'Omni Deskmat XXL Felt Mousepad',
    category: 'Computing',
    price: 1499,
    oldPrice: 1999,
    rating: 4.8,
    reviewsCount: 88,
    badge: 'ESSENTIAL',
    image: 'https://images.unsplash.com/photo-1616440342232-15637fa99c15?auto=format&fit=crop&w=800&q=85',
    description: 'Premium merino wool felt desk pad with non-slip natural rubber backing, anti-fray stitched edges, and water-repellent coating.',
    stock: true,
    brand: 'NovaTech',
    deal: false,
    featured: false,
    discount: 25,
    createdAt: '2026-01-08',
    tags: ['deskmat', 'mousepad', 'computing'],
    specifications: {
      'Dimensions': '900mm x 400mm x 4mm',
      'Material': 'Organic Merino Wool & Natural Rubber Base'
    }
  },

  // --- MOBILE (5 Products) ---
  {
    id: 'lumen-phone',
    name: 'Lumen Phone 5G Ultra',
    category: 'Mobile',
    price: 29999,
    oldPrice: 32999,
    rating: 4.6,
    reviewsCount: 128,
    badge: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra-fast 5G smartphone with Snapdragon 8 Gen 2 processor, 108MP OIS triple camera, and 120Hz LTPO AMOLED display.',
    stock: true,
    brand: 'Lumen',
    deal: false,
    featured: true,
    discount: 9,
    createdAt: '2026-02-04',
    tags: ['smartphone', '5g', '108mp', 'mobile'],
    specifications: {
      'Processor': 'Snapdragon 8 Gen 2 4nm',
      'RAM / Storage': '12GB LPDDR5X / 256GB UFS 4.0',
      'Main Camera': '108MP OIS + 12MP Ultra-wide + 10MP Tele',
      'Display': '6.67” 120Hz LTPO AMOLED',
      'Charging': '67W Fast Charge (100% in 35 mins)'
    }
  },
  {
    id: 'orbit-watch',
    name: 'Orbit Watch S3 Fitness Smartwatch',
    category: 'Mobile',
    price: 12499,
    oldPrice: 14999,
    rating: 4.7,
    reviewsCount: 189,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85',
    description: 'A refined everyday smartwatch featuring continuous SpO2 & ECG tracking, dual-band GPS, and 12-day battery life.',
    stock: true,
    brand: 'Orbit',
    deal: true,
    featured: true,
    discount: 16,
    createdAt: '2026-02-06',
    tags: ['smartwatch', 'fitness', 'gps', 'mobile'],
    specifications: {
      'Display': '1.43” AMOLED Always-On',
      'Battery': 'Up to 12 Days Normal Usage',
      'Sensors': 'Optical HR, SpO2, ECG, Gyro',
      'Waterproof': '5 ATM (50m Swimproof)',
      'Compatibility': 'iOS & Android'
    }
  },
  {
    id: 'charge-dock',
    name: 'ChargeStation Trio 15W Wireless Stand',
    category: 'Mobile',
    price: 4499,
    oldPrice: 5499,
    rating: 4.8,
    reviewsCount: 92,
    badge: '3-IN-1',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=85',
    description: 'Magnetic 3-in-1 fast wireless charging stand for smartphone, smartwatch, and wireless earbuds simultaneously.',
    stock: true,
    brand: 'NovaTech',
    deal: true,
    featured: false,
    discount: 18,
    createdAt: '2026-01-22',
    tags: ['charger', 'wireless', 'magsafe', 'mobile'],
    specifications: {
      'Phone Output': '15W MagSafe Fast Charge',
      'Watch Output': '5W Dedicated Magnetic Puck',
      'Earbuds Output': '5W Qi Wireless Pad'
    }
  },
  {
    id: 'ultra-pad',
    name: 'UltraPad 11 Pro AMOLED Tablet',
    category: 'Mobile',
    price: 42999,
    oldPrice: 49999,
    rating: 4.9,
    reviewsCount: 104,
    badge: 'CREATIVE TAB',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=85',
    description: 'Versatile 11-inch 2.8K 120Hz OLED tablet powered by octa-core AI chip, bundled with precision magnetic stylus.',
    stock: true,
    brand: 'UltraPad',
    deal: false,
    featured: true,
    discount: 14,
    createdAt: '2026-01-30',
    tags: ['tablet', 'mobile', 'stylus', 'oled'],
    specifications: {
      'Display': '11” 2.8K OLED 120Hz HDR10+',
      'Stylus': 'NovaPen 4096 Pressure Levels (Included)',
      'Battery': '8800mAh (45W Fast Charging)'
    }
  },
  {
    id: 'lens-mobile',
    name: 'Apex Mobile Anamorphic Camera Lens',
    category: 'Mobile',
    price: 3299,
    oldPrice: 4299,
    rating: 4.6,
    reviewsCount: 45,
    badge: 'CINEMATIC',
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=85',
    description: '1.33x anamorphic glass clip-on lens for smartphone video creators, delivering vintage horizontal lens flares and ultrawide ratio.',
    stock: true,
    brand: 'Apex',
    deal: true,
    featured: false,
    discount: 23,
    createdAt: '2026-01-14',
    tags: ['lens', 'mobile', 'camera', 'vlog'],
    specifications: {
      'Aspect Ratio': '2.40:1 CinemaScope',
      'Glass Type': 'Multi-coated Cinema Glass in Aluminum Housing'
    }
  },

  // --- SMART HOME (5 Products) ---
  {
    id: 'hub-max',
    name: 'Nova Smart Hub 10” Display',
    category: 'Smart Home',
    price: 11999,
    oldPrice: 14999,
    rating: 4.7,
    reviewsCount: 112,
    badge: 'SMART LIVING',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=85',
    description: 'Central smart home control screen with voice control, built-in Zigbee/Matter hub, stereo speakers, and video calling camera.',
    stock: true,
    brand: 'NovaTech',
    deal: true,
    featured: false,
    discount: 20,
    createdAt: '2026-02-02',
    tags: ['smarthome', 'hub', 'display', 'voice'],
    specifications: {
      'Screen': '10.1” HD IPS Touchscreen',
      'Smart Protocols': 'Matter, Zigbee, Wi-Fi 6, BLE',
      'Camera': '13MP Wide-angle with Privacy Shutter',
      'Speakers': 'Dual 2.0” 15W Stereo Speakers'
    }
  },
  {
    id: 'glow-ambient',
    name: 'Glow Smart Ambient Light Strip',
    category: 'Smart Home',
    price: 2999,
    oldPrice: 3999,
    rating: 4.6,
    reviewsCount: 88,
    badge: 'TOP VALUE',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=85',
    description: 'Addressable RGBIC LED light strip with music sync, app control, 16 million colors, and voice assistant integration.',
    stock: true,
    brand: 'Glow',
    deal: true,
    featured: false,
    discount: 25,
    createdAt: '2026-01-19',
    tags: ['rgb', 'lighting', 'smarthome'],
    specifications: {
      'Length': '5 Meters (Trimmable)',
      'Technology': 'RGBIC Segmented Color Control',
      'Control': 'App, Remote & Voice Control'
    }
  },
  {
    id: 'secure-cam',
    name: 'SafeView Outdoor Cam 2K Solar',
    category: 'Smart Home',
    price: 5999,
    oldPrice: 7499,
    rating: 4.8,
    reviewsCount: 142,
    badge: 'SECURITY',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=800&q=85',
    description: '100% wire-free 2K HDR security camera with integrated solar panel charger, AI human detection, and color night vision spotlight.',
    stock: true,
    brand: 'SafeView',
    deal: true,
    featured: true,
    discount: 20,
    createdAt: '2026-02-04',
    tags: ['camera', 'security', 'smarthome', 'solar'],
    specifications: {
      'Resolution': '2K QHD (2560 x 1440)',
      'Power Source': 'Continuous Solar Panel + 10,000mAh Battery',
      'Night Vision': 'Color Spotlight Night Vision up to 10m'
    }
  },
  {
    id: 'air-pure',
    name: 'AirSense Smart HEPA Air Purifier',
    category: 'Smart Home',
    price: 8499,
    oldPrice: 10999,
    rating: 4.9,
    reviewsCount: 96,
    badge: 'HEALTH TECH',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=85',
    description: '3-stage True HEPA H13 filtration removing 99.97% of airborne particles, equipped with PM2.5 laser sensor and whisper-quiet night mode.',
    stock: true,
    brand: 'AirSense',
    deal: false,
    featured: true,
    discount: 23,
    createdAt: '2026-01-26',
    tags: ['purifier', 'smarthome', 'health', 'hepa'],
    specifications: {
      'Coverage': 'Up to 450 sq ft (CADR 380 m³/h)',
      'Filter': 'Pre-filter + H13 True HEPA + Activated Carbon',
      'Noise Level': '22dB Sleep Mode'
    }
  },
  {
    id: 'smart-lock',
    name: 'KeyFree Biometric Smart Door Lock',
    category: 'Smart Home',
    price: 11499,
    oldPrice: 14499,
    rating: 4.8,
    reviewsCount: 68,
    badge: 'SECURITY',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=85',
    description: '6-in-1 keyless door lock featuring 3D semiconductor fingerprint reader, PIN code, RFID card, physical key, and mobile app unlock.',
    stock: true,
    brand: 'KeyFree',
    deal: false,
    featured: false,
    discount: 21,
    createdAt: '2026-01-11',
    tags: ['lock', 'security', 'smarthome', 'fingerprint'],
    specifications: {
      'Unlock Modes': 'Fingerprint, PIN, App, RFID, OTP, Key',
      'Material': 'Zinc Alloy Unibody with Anti-Theft Mortise'
    }
  },

  // --- GAMING (5 Products) ---
  {
    id: 'apex-controller',
    name: 'Apex Wireless Gaming Controller',
    category: 'Gaming',
    price: 5499,
    oldPrice: 6999,
    rating: 4.9,
    reviewsCount: 230,
    badge: 'HOT DEAL',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=85',
    description: 'Pro-grade controller with Hall effect anti-drift thumbsticks, back paddle buttons, adjustable trigger stops, and haptic feedback.',
    stock: true,
    brand: 'Apex',
    deal: true,
    featured: true,
    discount: 21,
    createdAt: '2026-02-05',
    tags: ['controller', 'gamepad', 'gaming', 'pc'],
    specifications: {
      'Sticks': 'Hall Effect Magnetic (No Drift)',
      'Buttons': 'Mechanical Tactile Switches',
      'Paddles': '4 Re-mappable Back Buttons',
      'Latency': '1ms Ultra-low Latency 2.4GHz',
      'Compatibility': 'PC, Switch, Android, iOS'
    }
  },
  {
    id: 'vortex-vr',
    name: 'Vortex All-in-One VR Headset 128GB',
    category: 'Gaming',
    price: 34999,
    oldPrice: 39999,
    rating: 4.8,
    reviewsCount: 61,
    badge: 'NEXT-GEN',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=85',
    description: 'Standalone wireless virtual reality system with 4K resolution display, inside-out tracking, and ergonomic active strap.',
    stock: true,
    brand: 'Vortex',
    deal: false,
    featured: true,
    discount: 12,
    createdAt: '2026-01-29',
    tags: ['vr', 'gaming', 'headset'],
    specifications: {
      'Per-Eye Resolution': '2160 x 2160 pixels (4K combined)',
      'Refresh Rate': '120Hz Fast-Switch LCD',
      'Processor': 'Snapdragon XR2 Gen 2',
      'Storage': '128GB High-Speed NVMe'
    }
  },
  {
    id: 'titan-chair',
    name: 'Titan Ergonomic Gaming Chair',
    category: 'Gaming',
    price: 18999,
    oldPrice: 22999,
    rating: 4.7,
    reviewsCount: 118,
    badge: 'COMFORT',
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=85',
    description: 'Ergonomic racing chair with memory foam magnetic lumbar pillow, 4D armrests, and 165° multi-tilt mechanism.',
    stock: true,
    brand: 'Titan',
    deal: true,
    featured: false,
    discount: 17,
    createdAt: '2026-01-16',
    tags: ['chair', 'gaming', 'ergonomic'],
    specifications: {
      'Upholstery': 'Breathable Softweave Fabric / PU Leather',
      'Weight Capacity': 'Up to 135 kg (Class 4 Gas Lift)',
      'Recline': '85° to 165° Lockable Tilt'
    }
  },
  {
    id: 'hyper-headset',
    name: 'Hyper 7.1 Wireless Gaming Headset',
    category: 'Gaming',
    price: 8999,
    oldPrice: 10999,
    rating: 4.8,
    reviewsCount: 145,
    badge: 'ESPORTS',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=85',
    description: 'Lossless 2.4GHz wireless esports headset with 50mm titanium drivers, detachable broadcast-grade mic, and 50-hour battery.',
    stock: true,
    brand: 'Hyper',
    deal: false,
    featured: false,
    discount: 18,
    createdAt: '2026-01-23',
    tags: ['headset', 'gaming', 'wireless', 'esports'],
    specifications: {
      'Surround Sound': '7.1 Spatial Audio Engine',
      'Battery': '50 Hours Playtime (Fast Charge 15m for 3 hrs)',
      'Weight': '280g Lightweight Design'
    }
  },
  {
    id: 'rgb-rig-light',
    name: 'StreamGlow RGB Light Tower Twin',
    category: 'Gaming',
    price: 4999,
    oldPrice: 6499,
    rating: 4.6,
    reviewsCount: 54,
    badge: 'STREAMER',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=85',
    description: 'Pair of vertical smart RGB lighting towers with screen color mirroring, audio visualizer, and desktop stand or monitor mount.',
    stock: true,
    brand: 'Glow',
    deal: true,
    featured: false,
    discount: 23,
    createdAt: '2026-01-09',
    tags: ['rgb', 'lighting', 'gaming', 'streamer'],
    specifications: {
      'Height': '42cm per tower',
      'Modes': '32 Dynamic Light Effects & Screen Sync'
    }
  },

  // --- WEARABLES (5 Products) ---
  {
    id: 'pulse-band',
    name: 'Pulse Band Active HR Tracker',
    category: 'Wearables',
    price: 3299,
    oldPrice: 4499,
    rating: 4.5,
    reviewsCount: 140,
    badge: 'SAVE 26%',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra-lightweight fitness tracker with curved AMOLED screen, 24/7 heart rate monitoring, sleep analysis, and 14-day battery.',
    stock: true,
    brand: 'Pulse',
    deal: true,
    featured: false,
    discount: 26,
    createdAt: '2026-01-27',
    tags: ['fitness', 'band', 'wearables', 'health'],
    specifications: {
      'Display': '1.47” Curved AMOLED',
      'Weight': '18g Lightweight Design',
      'Battery': '14 Days Typical Usage',
      'Sports Modes': '50+ Built-in Activity Modes'
    }
  },
  {
    id: 'aura-ring',
    name: 'Aura Health & Sleep Smart Ring',
    category: 'Wearables',
    price: 19999,
    oldPrice: 23999,
    rating: 4.9,
    reviewsCount: 82,
    badge: 'PREMIUM',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85',
    description: 'Titanium biometric ring tracking sleep stages, body temperature variation, HRV, and readiness score with zero subscription fees.',
    stock: true,
    brand: 'Aura',
    deal: false,
    featured: true,
    discount: 16,
    createdAt: '2026-02-02',
    tags: ['ring', 'wearables', 'health', 'sleep'],
    specifications: {
      'Material': 'Grade 5 Titanium with PVD Coating',
      'Sensors': 'Infrared Photoplethysmography, Temp, 3D Accelerometer',
      'Water Resistance': '100m Waterproof',
      'Battery': '7 Days Single Charge'
    }
  },
  {
    id: 'tempo-watch',
    name: 'Tempo Runner GPS Sport Watch',
    category: 'Wearables',
    price: 16499,
    oldPrice: 19999,
    rating: 4.8,
    reviewsCount: 91,
    badge: 'FOR RUNNERS',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=85',
    description: 'Dedicated running watch with multi-band GNSS, VO2 Max estimation, training load metrics, and offline music storage.',
    stock: true,
    brand: 'Tempo',
    deal: true,
    featured: false,
    discount: 18,
    createdAt: '2026-01-21',
    tags: ['watch', 'gps', 'running', 'wearables'],
    specifications: {
      'Display': '1.3” Transflective Memory-In-Pixel (Sunlight readable)',
      'Battery': 'Up to 20 Hours Continuous Multi-band GPS'
    }
  },
  {
    id: 'luxe-strap',
    name: 'Luxe Titanium Smartwatch Band',
    category: 'Wearables',
    price: 2499,
    oldPrice: 3299,
    rating: 4.7,
    reviewsCount: 38,
    badge: 'ACCESSORY',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85',
    description: 'Lightweight Grade 2 titanium link bracelet strap compatible with 20mm and 22mm quick-release smartwatch lugs.',
    stock: true,
    brand: 'NovaTech',
    deal: false,
    featured: false,
    discount: 24,
    createdAt: '2026-01-07',
    tags: ['strap', 'titanium', 'wearables'],
    specifications: {
      'Material': 'DLC Coated Pure Titanium',
      'Lug Size': 'Universal 20mm & 22mm Quick-Release Pins'
    }
  },
  {
    id: 'bio-patch',
    name: 'BioSense Continuous Glucose Sensor',
    category: 'Wearables',
    price: 4999,
    oldPrice: 5999,
    rating: 4.9,
    reviewsCount: 62,
    badge: 'BIO-TECH',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=85',
    description: 'Waterproof continuous metabolic sensor tracking real-time glucose response to meals and exercise via phone app.',
    stock: true,
    brand: 'BioSense',
    deal: false,
    featured: true,
    discount: 17,
    createdAt: '2026-01-17',
    tags: ['health', 'cgm', 'wearables', 'bio'],
    specifications: {
      'Sensor Life': '14 Days Continuous Monitoring',
      'Protection': 'IP68 Waterproof'
    }
  },

  // --- CAMERAS (5 Products) ---
  {
    id: 'pixel-cam',
    name: 'PixelCam Creator 4K Stream Cam',
    category: 'Cameras',
    price: 15999,
    oldPrice: 18999,
    rating: 4.8,
    reviewsCount: 74,
    badge: 'CREATOR TOOL',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=85',
    description: 'Compact 4K 60FPS creator webcam with AI auto-framing, dual stereo noise-reducing microphones, and HDR glass lens.',
    stock: true,
    brand: 'PixelCam',
    deal: false,
    featured: true,
    discount: 15,
    createdAt: '2026-02-01',
    tags: ['camera', '4k', 'streaming', 'cameras'],
    specifications: {
      'Max Resolution': '4K UHD 60FPS / 1080p 120FPS',
      'FOV': '90° Wide Angle Lens',
      'Focus': 'Dual-Pixel AI Autofocus',
      'Microphone': 'Dual Beamforming Mics'
    }
  },
  {
    id: 'cine-go',
    name: 'CineGo 3-Axis Pocket Camera Gimbal',
    category: 'Cameras',
    price: 24999,
    oldPrice: 29999,
    rating: 4.8,
    reviewsCount: 67,
    badge: 'DEAL',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra-portable 4K 60fps pocket camera with 3-axis mechanical stabilization, active face tracking, and rotatable touchscreen.',
    stock: true,
    brand: 'CineGo',
    deal: true,
    featured: false,
    discount: 16,
    createdAt: '2026-01-31',
    tags: ['camera', 'gimbal', '4k', 'vlogging', 'cameras'],
    specifications: {
      'Sensor': '1/1.7" CMOS 64MP',
      'Stabilization': '3-Axis Mechanical Gimbal',
      'Video': '4K at 60fps HDR',
      'Screen': '2” OLED Rotatable Touchscreen'
    }
  },
  {
    id: 'retro-snap',
    name: 'RetroSnap Mirrorless 24MP Digital Camera',
    category: 'Cameras',
    price: 54999,
    oldPrice: 62999,
    rating: 4.9,
    reviewsCount: 88,
    badge: 'VINTAGE TECH',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85',
    description: 'Classic rangefinder-style 24.2MP APS-C mirrorless camera with dedicated tactile dials, film simulation modes, and 4K 30p video.',
    stock: true,
    brand: 'RetroSnap',
    deal: false,
    featured: true,
    discount: 13,
    createdAt: '2026-02-06',
    tags: ['camera', 'mirrorless', 'photography', 'cameras'],
    specifications: {
      'Sensor': '24.2MP APS-C CMOS Sensor',
      'Lens Mount': 'Universal Mirrorless Bayonet Mount',
      'Viewfinder': '2.36m-dot OLED Electronic Viewfinder'
    }
  },
  {
    id: 'action-pro',
    name: 'ActionX 4K Waterproof Action Cam',
    category: 'Cameras',
    price: 18999,
    oldPrice: 22999,
    rating: 4.7,
    reviewsCount: 110,
    badge: 'EXTREME',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=85',
    description: 'Rugged 4K 120fps sports action camera with dual color screens, horizon-level stabilization, and 16m native waterproof depth.',
    stock: true,
    brand: 'ActionX',
    deal: true,
    featured: false,
    discount: 17,
    createdAt: '2026-01-24',
    tags: ['action', 'camera', 'waterproof', 'cameras'],
    specifications: {
      'Waterproofing': '16 Meters Native (60m with housing)',
      'Video': '4K @ 120fps / 2.7K @ 240fps'
    }
  },
  {
    id: 'lens-50mm',
    name: 'PrimeLens 50mm f/1.4 Art Portrait Lens',
    category: 'Cameras',
    price: 21499,
    oldPrice: 24999,
    rating: 4.9,
    reviewsCount: 54,
    badge: 'SHARP GLASS',
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra-fast f/1.4 prime lens delivering creamy bokeh, razor-sharp edge contrast, and silent linear stepping autofocus motor.',
    stock: true,
    brand: 'PrimeLens',
    deal: false,
    featured: false,
    discount: 14,
    createdAt: '2026-01-13',
    tags: ['lens', 'camera', 'portrait', 'cameras'],
    specifications: {
      'Aperture Range': 'f/1.4 to f/16 (9 Circular Blades)',
      'Filter Thread': '67mm'
    }
  },

  // --- ACCESSORIES (5 Products) ---
  {
    id: 'power-vault',
    name: 'Nova Power Vault 20,000mAh 65W',
    category: 'Accessories',
    price: 2799,
    oldPrice: 3499,
    rating: 4.9,
    reviewsCount: 310,
    badge: 'MUST HAVE',
    image: 'https://images.unsplash.com/photo-1609592424009-548777123ef6?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra-fast 65W Power Delivery power bank capable of charging laptops, phones, and tablets simultaneously with digital LED status display.',
    stock: true,
    brand: 'NovaTech',
    deal: true,
    featured: true,
    discount: 20,
    createdAt: '2026-02-03',
    tags: ['powerbank', 'charger', 'accessories', '65w'],
    specifications: {
      'Capacity': '20,000mAh / 74Wh',
      'Max Output': '65W USB-C PD 3.0',
      'Ports': '2x USB-C (Input/Output), 1x USB-A QC 4.0',
      'Display': 'Digital LED Battery Percentage Indicator'
    }
  },
  {
    id: 'tech-pouch',
    name: 'Cordura Everyday Organizer Tech Pouch',
    category: 'Accessories',
    price: 1899,
    oldPrice: 2499,
    rating: 4.7,
    reviewsCount: 94,
    badge: 'ORGANIZER',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85',
    description: 'Weatherproof Cordura fabric organizer pouch with origami-style pockets for cables, chargers, drives, and power banks.',
    stock: true,
    brand: 'NovaTech',
    deal: false,
    featured: false,
    discount: 24,
    createdAt: '2026-01-16',
    tags: ['pouch', 'bag', 'accessories', 'organizer'],
    specifications: {
      'Material': 'Water-resistant 500D Cordura Nylon',
      'Dimensions': '24cm x 15cm x 10cm',
      'Capacity': '2 Liters'
    }
  },
  {
    id: 'cable-braided',
    name: 'Kevlar USB-C 100W Fast Charging Cable 2m',
    category: 'Accessories',
    price: 999,
    oldPrice: 1499,
    rating: 4.9,
    reviewsCount: 420,
    badge: 'DURABLE',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=85',
    description: 'Heavy-duty Kevlar-reinforced double braided nylon cable supporting 100W PD charging and 480Mbps data transfer.',
    stock: true,
    brand: 'NovaTech',
    deal: true,
    featured: false,
    discount: 33,
    createdAt: '2026-01-05',
    tags: ['cable', 'usbc', 'accessories', 'charging'],
    specifications: {
      'Power Rating': '100W (20V / 5A PD 3.0)',
      'Bend Test Rating': '35,000+ Bends Lifespan',
      'Length': '2 Meters'
    }
  },
  {
    id: 'gan-charger',
    name: 'GaN Ultra 100W 4-Port Compact Charger',
    category: 'Accessories',
    price: 3499,
    oldPrice: 4499,
    rating: 4.8,
    reviewsCount: 168,
    badge: 'COMPACT',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=85',
    description: 'Pocket-sized Gallium Nitride (GaN III) fast charger with 3x USB-C PD ports and 1x USB-A port for laptop & multi-device charging.',
    stock: true,
    brand: 'NovaTech',
    deal: false,
    featured: true,
    discount: 22,
    createdAt: '2026-01-29',
    tags: ['charger', 'gan', 'usbc', 'accessories'],
    specifications: {
      'Technology': 'GaN III Semiconductor',
      'Total Output': '100W Max Shared Output'
    }
  },
  {
    id: 'clean-kit',
    name: 'Precision Optics & Screen Cleaning Kit',
    category: 'Accessories',
    price: 699,
    oldPrice: 999,
    rating: 4.7,
    reviewsCount: 210,
    badge: 'CARE KIT',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=85',
    description: 'Alcohol-free anti-static screen spray with micro-fiber cloth, air blower, and soft bristle brush for screens, lenses, and keycaps.',
    stock: true,
    brand: 'NovaTech',
    deal: false,
    featured: false,
    discount: 30,
    createdAt: '2026-01-02',
    tags: ['cleaner', 'accessories', 'kit'],
    specifications: {
      'Volume': '100ml Non-toxic Formula'
    }
  },

  // --- TVs & DISPLAYS (5 Products) ---
  {
    id: 'vision-65',
    name: 'Vision 65” QLED 4K HDR Smart TV',
    category: 'TVs & Displays',
    price: 64999,
    oldPrice: 79999,
    rating: 4.9,
    reviewsCount: 153,
    badge: 'MEGA SAVINGS',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=85',
    description: 'Stunning 65-inch 4K QLED screen with Quantum Dot color, Dolby Vision IQ, 120Hz Motion Clarity, and 40W Dolby Atmos speakers.',
    stock: true,
    brand: 'Vision',
    deal: true,
    featured: true,
    discount: 19,
    createdAt: '2026-02-06',
    tags: ['tv', 'qled', '4k', 'tvs & displays', 'smart tv'],
    specifications: {
      'Screen Size': '65 Inches (163 cm)',
      'Display Tech': 'Quantum Dot QLED 4K (3840 x 2160)',
      'HDR Format': 'Dolby Vision IQ, HDR10+, HLG',
      'Audio': '40W 2.1 Ch Dolby Atmos Speakers',
      'OS': 'Google TV with Hands-free Voice Search'
    }
  },
  {
    id: 'canvas-art-tv',
    name: 'Frame Canvas 55” Art QLED TV',
    category: 'TVs & Displays',
    price: 52999,
    oldPrice: 62999,
    rating: 4.8,
    reviewsCount: 94,
    badge: 'ART DISPLAY',
    image: 'https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&w=800&q=85',
    description: 'Matte anti-reflective 4K QLED TV that transforms into customizable museum art when turned off, with magnetic wood bezel options.',
    stock: true,
    brand: 'Vision',
    deal: false,
    featured: true,
    discount: 16,
    createdAt: '2026-01-25',
    tags: ['tv', 'art', '55inch', 'tvs & displays'],
    specifications: {
      'Display': '55” Matte QLED 4K Ultra HD',
      'Art Mode': 'Built-in Art Store with 1,500+ Classic Masterpieces'
    }
  },
  {
    id: 'cine-projector',
    name: 'CineBeam 4K Laser UST Projector',
    category: 'TVs & Displays',
    price: 89999,
    oldPrice: 109999,
    rating: 4.9,
    reviewsCount: 42,
    badge: 'HOME CINEMA',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra Short Throw 4K laser projector casting a crisp 120-inch screen from just 7 inches away with 2500 ANSI lumens brightness.',
    stock: true,
    brand: 'CineBeam',
    deal: true,
    featured: true,
    discount: 18,
    createdAt: '2026-02-02',
    tags: ['projector', '4k', 'laser', 'tvs & displays'],
    specifications: {
      'Light Source': 'Dual-Laser 2500 ANSI Lumens (25,000 hrs lifespan)',
      'Projection Size': '80" to 120" Screen Size'
    }
  },
  {
    id: 'portable-monitor',
    name: 'FlexView 15.6” OLED Portable Monitor',
    category: 'TVs & Displays',
    price: 17999,
    oldPrice: 21999,
    rating: 4.7,
    reviewsCount: 78,
    badge: 'PORTABLE',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=85',
    description: 'Ultra-thin 15.6-inch Full HD OLED portable monitor powered via single USB-C cable, featuring integrated magnetic cover stand.',
    stock: true,
    brand: 'NovaTech',
    deal: false,
    featured: false,
    discount: 18,
    createdAt: '2026-01-18',
    tags: ['monitor', 'portable', 'oled', 'tvs & displays'],
    specifications: {
      'Panel': '15.6” OLED 100% DCI-P3 Color',
      'Weight': '650g Super Lightweight Aluminum body'
    }
  },
  {
    id: 'gaming-display-27',
    name: 'Apex 27” Fast-IPS 240Hz Esports Display',
    category: 'TVs & Displays',
    price: 24999,
    oldPrice: 29999,
    rating: 4.8,
    reviewsCount: 132,
    badge: '240HZ SPEED',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=85',
    description: 'Competitive 27-inch 240Hz 0.5ms Fast-IPS gaming monitor with G-Sync compatibility, HDR400, and height-adjustable stand.',
    stock: false,
    brand: 'Apex',
    deal: true,
    featured: false,
    discount: 17,
    createdAt: '2026-01-30',
    tags: ['monitor', '240hz', 'gaming', 'tvs & displays'],
    specifications: {
      'Refresh Rate': '240Hz Native',
      'Response Time': '0.5ms MPRT'
    }
  }
];

// Available categories list
const NOVATECH_CATEGORIES = [
  'All Categories',
  'Audio',
  'Computing',
  'Mobile',
  'Smart Home',
  'Gaming',
  'Wearables',
  'Cameras',
  'Accessories',
  'TVs & Displays'
];

// Central Storage State Management
const Storage = {
  get(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data !== null ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing key ${key} to localStorage:`, e);
    }
  }
};

// Application State Getters and Setters
function getCart() { return Storage.get('novatech-cart', []); }
function setCart(cart) { Storage.set('novatech-cart', cart); }

function getWishlist() { return Storage.get('novatech-wishlist', []); }
function setWishlist(wishlist) { Storage.set('novatech-wishlist', wishlist); }

function getWishlistQuantities() { return Storage.get('novatech-wishlist-quantities', {}); }
function setWishlistQuantities(qtys) { Storage.set('novatech-wishlist-quantities', qtys); }

function getTheme() { return localStorage.getItem('novatech-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
function setTheme(theme) { localStorage.setItem('novatech-theme', theme); document.documentElement.dataset.theme = theme; }

function getProfile() {
  return Storage.get('novatech-profile', {
    name: '',
    email: '',
    phone: '',
    joined: 'January 2026'
  });
}
function setProfile(profile) { Storage.set('novatech-profile', profile); }

function getAddresses() {
  return Storage.get('novatech-addresses', [
    {
      id: 'addr-1',
      name: 'Home',
      pin: '400001',
      address: 'Flat 402, Skyline Residency, Marine Lines',
      city: 'Mumbai',
      state: 'Maharashtra',
      isDefault: true
    },
    {
      id: 'addr-2',
      name: 'Work',
      pin: '560001',
      address: 'Tech Park Tower B, 5th Floor, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      isDefault: false
    }
  ]);
}
function setAddresses(addresses) { Storage.set('novatech-addresses', addresses); }

function getSelectedLocation() {
  const addresses = getAddresses();
  const def = addresses.find(a => a.isDefault) || addresses[0];
  return Storage.get('novatech-location', def ? { pin: def.pin, name: def.name, address: def.address } : { pin: '400001', name: 'Home', address: 'Mumbai' });
}
function setSelectedLocation(loc) { Storage.set('novatech-location', loc); }

function getOrders() {
  return Storage.get('novatech-orders', [
    {
      id: 'NT-2026-98124',
      date: '2026-08-01',
      items: [
        { id: 'nova-x1', name: 'Nova X1 Wireless Headphones', price: 9999, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' },
        { id: 'power-vault', name: 'Nova Power Vault 20,000mAh 65W', price: 2799, quantity: 1, image: 'https://images.unsplash.com/photo-1609592424009-548777123ef6?auto=format&fit=crop&w=400&q=80' }
      ],
      subtotal: 12798,
      discount: 1000,
      delivery: 0,
      total: 11798,
      paymentMethod: 'UPI',
      status: 'Delivered',
      address: 'Flat 402, Skyline Residency, Marine Lines, Mumbai - 400001',
      trackingStep: 4,
      returnRequested: false,
      returnReason: ''
    }
  ]);
}

function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  Storage.set('novatech-orders', orders);
  
  // Award points cashback (10% of order total)
  const pointsEarned = Math.round(order.total * 0.1);
  addRewardPoints(pointsEarned, `Purchase Cashback #${order.id}`);
  checkAndUnlockAchievements();
}

function updateOrderStatus(orderId, updateObj) {
  const orders = getOrders();
  const target = orders.find(o => o.id === orderId);
  if (target) {
    Object.assign(target, updateObj);
    Storage.set('novatech-orders', orders);
  }
}

function getRewards() {
  return Storage.get('novatech-rewards', {
    points: 1210,
    unlockedAchievements: ['explorer', 'first_purchase', 'spend_5000', 'spend_10000', 'deal_hunter'],
    history: [
      { action: 'Created Account', points: 100, date: '2026-01-15' },
      { action: 'Explored NovaTech catalog', points: 30, date: '2026-01-20' },
      { action: 'Unlocked Achievement: First Purchase', points: 100, date: '2026-08-01' },
      { action: 'Unlocked Achievement: Big Spender', points: 200, date: '2026-08-01' },
      { action: 'Unlocked Achievement: VIP Buyer', points: 500, date: '2026-08-01' },
      { action: 'Unlocked Achievement: Deal Hunter', points: 80, date: '2026-08-01' },
      { action: 'Purchase Cashback #NT-2026-98124', points: 200, date: '2026-08-01' }
    ]
  });
}

function addRewardPoints(points, reason) {
  if (points <= 0) return;
  const rewards = getRewards();
  rewards.points += points;
  rewards.history.unshift({
    action: reason,
    points: points,
    date: new Date().toISOString().split('T')[0]
  });
  Storage.set('novatech-rewards', rewards);
}

const NOVATECH_ACHIEVEMENTS = [
  { id: 'first_purchase', name: 'First Purchase', desc: 'Completed your first order on NovaTech', points: 100, icon: '🛍️' },
  { id: 'first_wishlist', name: 'First Wishlist', desc: 'Saved your first product to wishlist', points: 20, icon: '♥' },
  { id: 'three_products', name: 'Collector', desc: 'Purchased 3 or more products total', points: 150, icon: '📦' },
  { id: 'spend_5000', name: 'Big Spender', desc: 'Reached ₹5,000 lifetime spend', points: 200, icon: '💎' },
  { id: 'spend_10000', name: 'VIP Buyer', desc: 'Reached ₹10,000 lifetime spend', points: 500, icon: '👑' },
  { id: 'deal_hunter', name: 'Deal Hunter', desc: 'Purchased a product from Deals of the Day', points: 80, icon: '🏷️' },
  { id: 'explorer', name: 'NovaTech Explorer', desc: 'Browsed product categories & search', points: 30, icon: '🧭' },
  { id: 'repeat_customer', name: 'Repeat Customer', desc: 'Placed 2 or more orders', points: 250, icon: '⚡' }
];

// Idempotent Achievement Unlocking Check
function checkAndUnlockAchievements() {
  const rewards = getRewards();
  const orders = getOrders();
  const wishlist = getWishlist();
  const unlocked = new Set(rewards.unlockedAchievements || []);

  let newlyUnlockedPoints = 0;

  function tryUnlock(achId) {
    if (!unlocked.has(achId)) {
      unlocked.add(achId);
      const ach = NOVATECH_ACHIEVEMENTS.find(a => a.id === achId);
      if (ach) {
        newlyUnlockedPoints += ach.points;
        rewards.history.unshift({
          action: `Unlocked Achievement: ${ach.name}`,
          points: ach.points,
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }

  if (wishlist.length > 0) tryUnlock('first_wishlist');
  if (orders.length >= 1) tryUnlock('first_purchase');
  if (orders.length >= 2) tryUnlock('repeat_customer');

  const totalItemsCount = orders.reduce((sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0), 0);
  if (totalItemsCount >= 3) tryUnlock('three_products');

  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
  if (totalSpend >= 5000) tryUnlock('spend_5000');
  if (totalSpend >= 10000) tryUnlock('spend_10000');

  const boughtDeal = orders.some(o => o.items.some(i => {
    const p = NOVATECH_PRODUCTS.find(prod => prod.id === i.id);
    return p && p.deal;
  }));
  if (boughtDeal) tryUnlock('deal_hunter');

  if (newlyUnlockedPoints > 0) {
    rewards.points += newlyUnlockedPoints;
    rewards.unlockedAchievements = Array.from(unlocked);
    Storage.set('novatech-rewards', rewards);
    if (typeof showToast === 'function') {
      showToast(`🏆 Achievement Unlocked! +${newlyUnlockedPoints} bonus points earned!`);
    }
  } else {
    rewards.unlockedAchievements = Array.from(unlocked);
    Storage.set('novatech-rewards', rewards);
  }
}

// Utility Helper
const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
