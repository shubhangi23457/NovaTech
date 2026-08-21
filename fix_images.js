const fs = require('fs');

// Curated Unsplash image map — matched to each product category/name
// Format: keyword (lowercased) -> unsplash photo URL
const imageMap = {
  // ── Mobiles & Tablets ──
  'mobiles & tablets':        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=85',
  'smartphones':              'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&q=85',
  'feature phones':           'https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=700&q=85',
  'tablets':                  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&q=85',
  'e-readers':                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&q=85',
  'tablet cases':             'https://images.unsplash.com/photo-1600087626088-5f16fe01bfd8?w=700&q=85',
  'phone cases':              'https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?w=700&q=85',
  'screen protectors':        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=700&q=85',
  'tablet screen protectors': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&q=85',
  'stylus pens':              'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=700&q=85',
  'sim card accessories':     'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&q=85',

  // ── Computers & Laptops ──
  'computers & laptops':      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=85',
  'laptops':                  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&q=85',
  'gaming laptops':           'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&q=85',
  'business laptops':         'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=85',
  'desktop computers':        'https://images.unsplash.com/photo-1593640408182-31c228cc30ca?w=700&q=85',
  'all-in-one pcs':           'https://images.unsplash.com/photo-1527443224154-c4a573d5aaba?w=700&q=85',
  'mini pcs':                 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=85',
  'gaming pcs':               'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=700&q=85',
  'monitors':                 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=85',
  'mechanical keyboards':     'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=85',
  'wireless keyboards':       'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=85',
  'gaming keyboards':         'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=700&q=85',
  'wireless mice':            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=85',
  'gaming mice':              'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&q=85',
  'webcams':                  'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=700&q=85',
  'laptop stands':            'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=700&q=85',
  'laptop bags':              'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=85',
  'cooling pads':             'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=85',
  'graphics cards':           'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=700&q=85',
  'cpus':                     'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&q=85',
  'motherboards':             'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=85',
  'ram':                      'https://images.unsplash.com/photo-1562976540-1502c2145851?w=700&q=85',
  'ssds':                     'https://images.unsplash.com/photo-1608036328813-3fa4b96e3bf0?w=700&q=85',
  'hdds':                     'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',
  'pc cases':                 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&q=85',
  'pc power supplies':        'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&q=85',
  'cpu coolers':              'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=700&q=85',

  // ── Audio ──
  'audio':                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85',
  'wireless earbuds':         'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&q=85',
  'wired earphones':          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=700&q=85',
  'over-ear headphones':      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85',
  'on-ear headphones':        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&q=85',
  'gaming headsets':          'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=700&q=85',
  'bluetooth speakers':       'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&q=85',
  'portable speakers':        'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=700&q=85',
  'soundbars':                'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&q=85',
  'home theater systems':     'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=700&q=85',
  'microphones':              'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=700&q=85',
  'usb microphones':          'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=700&q=85',
  'audio interfaces':         'https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?w=700&q=85',
  'dacs':                     'https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?w=700&q=85',
  'amplifiers':               'https://images.unsplash.com/photo-1545346315-f4c47e3e1b55?w=700&q=85',
  'subwoofers':               'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&q=85',

  // ── Gaming ──
  'gaming':                   'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=700&q=85',
  'gaming consoles':          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=700&q=85',
  'handheld gaming consoles': 'https://images.unsplash.com/photo-1559016756-2b1b92a3e6ef?w=700&q=85',
  'game controllers':         'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&q=85',
  'gaming monitors':          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=85',
  'gaming chairs':            'https://images.unsplash.com/photo-1612832021455-245704c6755a?w=700&q=85',
  'racing wheels':            'https://images.unsplash.com/photo-1547558902-5a7b5a0bd9d1?w=700&q=85',
  'vr headsets':              'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=700&q=85',
  'gaming capture cards':     'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=700&q=85',
  'gaming accessories':       'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=700&q=85',
  'console accessories':      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=700&q=85',
  'physical video games':     'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=700&q=85',

  // ── Cameras & Photography ──
  'cameras & photography':    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=85',
  'dslr cameras':             'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=700&q=85',
  'mirrorless cameras':       'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=85',
  'compact cameras':          'https://images.unsplash.com/photo-1449495169669-7b118f960251?w=700&q=85',
  'action cameras':           'https://images.unsplash.com/photo-1547407139-3c921a66005c?w=700&q=85',
  'instant cameras':          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700&q=85',
  'security cameras':         'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=700&q=85',
  'camera lenses':            'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=700&q=85',
  'camera bags':              'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=85',
  'tripods':                  'https://images.unsplash.com/photo-1617170167756-f0023d24cd4d?w=700&q=85',
  'gimbals':                  'https://images.unsplash.com/photo-1589494168980-4ef2bce5d12d?w=700&q=85',
  'camera flashes':           'https://images.unsplash.com/photo-1617170167756-f0023d24cd4d?w=700&q=85',
  'memory cards':             'https://images.unsplash.com/photo-1617631228967-7d3e49bde34a?w=700&q=85',
  'camera batteries':         'https://images.unsplash.com/photo-1608036328813-3fa4b96e3bf0?w=700&q=85',
  'camera chargers':          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'camera cleaning kits':     'https://images.unsplash.com/photo-1617170167756-f0023d24cd4d?w=700&q=85',

  // ── Wearables ──
  'wearables':                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=85',
  'smartwatches':             'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=85',
  'fitness bands':            'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=700&q=85',
  'smart rings':              'https://images.unsplash.com/photo-1546869104-c3f678267bc8?w=700&q=85',
  'smart glasses':            'https://images.unsplash.com/photo-1574169208507-84376144848b?w=700&q=85',
  'watch straps':             'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=85',
  'smartwatch chargers':      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'wearable accessories':     'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=700&q=85',

  // ── TV & Entertainment ──
  'tv & entertainment':       'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=85',
  'smart tvs':                'https://images.unsplash.com/photo-1571415060716-baff5f717ce1?w=700&q=85',
  'led tvs':                  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=85',
  'oled tvs':                 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=85',
  'qled tvs':                 'https://images.unsplash.com/photo-1571415060716-baff5f717ce1?w=700&q=85',
  '4k tvs':                   'https://images.unsplash.com/photo-1571415060716-baff5f717ce1?w=700&q=85',
  '8k tvs':                   'https://images.unsplash.com/photo-1571415060716-baff5f717ce1?w=700&q=85',
  'projectors':               'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&q=85',
  'streaming devices':        'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'media players':            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&q=85',
  'tv mounts':                'https://images.unsplash.com/photo-1571415060716-baff5f717ce1?w=700&q=85',
  'tv stands':                'https://images.unsplash.com/photo-1571415060716-baff5f717ce1?w=700&q=85',
  'hdmi cables':              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=85',
  'remote controls':          'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&q=85',
  'blu-ray players':          'https://images.unsplash.com/photo-1571415060716-baff5f717ce1?w=700&q=85',

  // ── Smart Home ──
  'smart home':               'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart bulbs':              'https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=700&q=85',
  'smart led strips':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85',
  'smart plugs':              'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart switches':           'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart speakers':           'https://images.unsplash.com/photo-1543512214-318c7553f230?w=700&q=85',
  'smart displays':           'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart doorbells':          'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=700&q=85',
  'smart locks':              'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart cameras':            'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=700&q=85',
  'motion sensors':           'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'door sensors':             'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'temperature sensors':      'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart thermostats':        'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart hubs':               'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
  'smart home controllers':   'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',

  // ── Printers & Office ──
  'printers & office electronics': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  'inkjet printers':          'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  'laser printers':           'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  'all-in-one printers':      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  'photo printers':           'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  'label printers':           'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  '3d printers':              'https://images.unsplash.com/photo-1562408590-e32931084e23?w=700&q=85',
  'scanners':                 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  'document cameras':         'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=85',
  'shredders':                'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=700&q=85',
  'calculators':              'https://images.unsplash.com/photo-1587939003752-f18f5b67f1f9?w=700&q=85',
  'barcode scanners':         'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=700&q=85',
  'pos machines':             'https://images.unsplash.com/photo-1601000938259-5f13c26e8736?w=700&q=85',

  // ── Networking ──
  'networking':               'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'wi-fi routers':            'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  '5g routers':               'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'mesh wi-fi systems':       'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'wi-fi extenders':          'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'network switches':         'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=85',
  'modems':                   'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'access points':            'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'network adapters':         'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=85',
  'usb wi-fi adapters':       'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'ethernet cables':          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=85',
  'network cables':           'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=85',
  'network storage devices':  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',

  // ── Power & Charging ──
  'power & charging':         'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'power banks':              'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=700&q=85',
  'wall chargers':            'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'fast chargers':            'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'wireless chargers':        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=700&q=85',
  'charging stations':        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'usb hubs':                 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=85',
  'usb-c hubs':               'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=85',
  'power strips':             'https://images.unsplash.com/photo-1601000938259-5f13c26e8736?w=700&q=85',
  'surge protectors':         'https://images.unsplash.com/photo-1601000938259-5f13c26e8736?w=700&q=85',
  'extension boards':         'https://images.unsplash.com/photo-1601000938259-5f13c26e8736?w=700&q=85',
  'ups systems':              'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',
  'inverters':                'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',
  'portable power stations':  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=700&q=85',
  'car chargers':             'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'charging cables':          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'usb-c cables':             'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'lightning cables':         'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'adapters':                 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=85',

  // ── Car Electronics ──
  'dash cameras':             'https://images.unsplash.com/photo-1547888541-16b4c854b9c4?w=700&q=85',
  'bluetooth car adapters':   'https://images.unsplash.com/photo-1547888541-16b4c854b9c4?w=700&q=85',
  'fm transmitters':          'https://images.unsplash.com/photo-1547888541-16b4c854b9c4?w=700&q=85',
  'car speakers':             'https://images.unsplash.com/photo-1547888541-16b4c854b9c4?w=700&q=85',
  'car subwoofers':           'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&q=85',
  'car amplifiers':           'https://images.unsplash.com/photo-1545346315-f4c47e3e1b55?w=700&q=85',
  'car phone holders':        'https://images.unsplash.com/photo-1547888541-16b4c854b9c4?w=700&q=85',
  'gps navigation devices':   'https://images.unsplash.com/photo-1547888541-16b4c854b9c4?w=700&q=85',
  'tire pressure monitoring systems': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=700&q=85',
  'car vacuum cleaners':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85',
  'car jump starters':        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=700&q=85',
  'parking sensors':          'https://images.unsplash.com/photo-1547888541-16b4c854b9c4?w=700&q=85',
  'reverse cameras':          'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=700&q=85',
  'car led lights':           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85',

  // ── Storage & Memory ──
  'external ssds':            'https://images.unsplash.com/photo-1608036328813-3fa4b96e3bf0?w=700&q=85',
  'hard disk drives':         'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',
  'external hard drives':     'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',
  'usb flash drives':         'https://images.unsplash.com/photo-1617631228967-7d3e49bde34a?w=700&q=85',
  'card readers':             'https://images.unsplash.com/photo-1617631228967-7d3e49bde34a?w=700&q=85',
  'portable storage devices': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',
  'nas storage':              'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=85',

  // ── Accessories ──
  'laptop sleeves':           'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=85',
  'keyboard covers':          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=85',
  'mouse pads':               'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=85',
  'cable organizers':         'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=85',
  'cleaning kits':            'https://images.unsplash.com/photo-1617170167756-f0023d24cd4d?w=700&q=85',
  'stands':                   'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=700&q=85',
  'mounts':                   'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=700&q=85',
  'replacement cables':       'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'replacement chargers':     'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',

  // ── Deals & Collections ──
  'best sellers':             'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'new arrivals':             'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'trending products':        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'deals of the day':         'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'flash sale':               'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'clearance sale':           'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'bundle deals':             'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'refurbished electronics':  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'open-box products':        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'under ₹999':               'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'under ₹2,999':             'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'under ₹4,999':             'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',
  'under ₹9,999':             'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85',

  // ── Brands ──
  'apple':       'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=700&q=85',
  'samsung':     'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&q=85',
  'sony':        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85',
  'lg':          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=85',
  'oneplus':     'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&q=85',
  'xiaomi':      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=85',
  'google':      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&q=85',
  'motorola':    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=85',
  'lenovo':      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=85',
  'hp':          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&q=85',
  'dell':        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=85',
  'asus':        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&q=85',
  'acer':        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&q=85',
  'msi':         'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=700&q=85',
  'jbl':         'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&q=85',
  'boat':        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&q=85',
  'bose':        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85',
  'sennheiser':  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&q=85',
  'logitech':    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=85',
  'corsair':     'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=700&q=85',
  'razer':       'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&q=85',
  'canon':       'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=700&q=85',
  'nikon':       'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=85',
  'gopro':       'https://images.unsplash.com/photo-1547407139-3c921a66005c?w=700&q=85',
  'philips':     'https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=700&q=85',
  'tp-link':     'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=85',
  'anker':       'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=85',
  'nothing':     'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&q=85',
  'realme':      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=85',
  'amazon':      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=700&q=85',
  'microsoft':   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=85',
  'nintendo':    'https://images.unsplash.com/photo-1559016756-2b1b92a3e6ef?w=700&q=85',
  'playstation': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=700&q=85',
  'xbox':        'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=700&q=85',
};

// Default fallback per category
const categoryFallback = {
  'Mobile':     'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=85',
  'Computing':  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=85',
  'Audio':      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85',
  'Smart Home': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=85',
};

let script = fs.readFileSync('script.js', 'utf8');

// Replace all loremflickr images
let replacedCount = 0;

script = script.replace(
  /\{ id: '([^']+)', name: '([^']+)', category: '([^']+)', price: (\d+), oldPrice: (\d+), rating: '([^']+)', badge: '([^']*)', image: 'https:\/\/loremflickr\.com\/[^']+', description: '([^']+)' \}/g,
  (match, id, name, category, price, oldPrice, rating, badge, description) => {
    const key = name.toLowerCase().replace(/&amp;/g, '&');
    const img = imageMap[key] || categoryFallback[category] || imageMap['best sellers'];
    replacedCount++;
    // Fix the & encoding if it's in name
    const cleanName = name.replace(/&amp;/g, '&');
    const cleanDesc = description.replace(/&amp;/g, '&');
    return `{ id: '${id}', name: '${cleanName}', category: '${category}', price: ${price}, oldPrice: ${oldPrice}, rating: '${rating}', badge: '${badge}', image: '${img}', description: '${cleanDesc}' }`;
  }
);

fs.writeFileSync('script.js', script);
console.log(`✅ Replaced ${replacedCount} loremflickr image URLs with real product images.`);
